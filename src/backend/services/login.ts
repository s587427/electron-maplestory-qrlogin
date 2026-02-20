import { IQRCodeManager, QRCodeManagerType } from "../classes/QRCodeManager"
import { getAccounts } from "./account"
import { beanfunClient } from "./axios"

async function getSessionKey() {
  const res = await beanfunClient.get(
    "https://tw.beanfun.com/beanfun_block/bflogin/default.aspx?service=999999_T0"
  )

  // beanfunClient 的最後 URL 在這裡
  const finalUrl = res.request.res.responseUrl

  console.log("Final URL:", finalUrl)
  // 解析 query
  const parsed = new URL(finalUrl)

  const skey = parsed.searchParams.get("skey")

  return skey
}

async function getQRCodeValue(skey: string) {
  try {
    // 1. Download HTML response
    const url = `https://tw.newlogin.beanfun.com/login/qr_form.aspx?skey=${skey}`

    const res = await beanfunClient.get(url)

    const response = res.data // HTML string

    // 2. Extract __VIEWSTATE
    let regex = /id="__VIEWSTATE" value="(.*)" \/>/

    if (!regex.test(response)) {
      throw new Error("LoginNoViewstate")
    }

    const viewstate = response.match(regex)[1]

    // 3. Extract __EVENTVALIDATION
    regex = /id="__EVENTVALIDATION" value="(.*)" \/>/

    if (!regex.test(response)) {
      throw new Error("LoginNoEventvalidation")
    }

    const eventvalidation = response.match(regex)[1]

    // 4. Extract QR Code Hash Path
    regex =
      /\$\("#theQrCodeImg"\)\.attr\("src", "\.\.\/(.*)" \+ obj\.strEncryptData\);/

    if (!regex.test(response)) {
      throw new Error("LoginNoHash")
    }

    const value = response.match(regex)[1]

    // 5.Get OR Code Encrypt Data
    const strEncryptData = await getQRCodeStrEncryptData(skey)

    return {
      skey,
      viewstate,
      eventvalidation,
      value: strEncryptData,
      bitmapUrl: "https://tw.newlogin.beanfun.com/" + value,
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("getQRCodeValue error:", err.message)
    } else {
      console.log("Unknown error:", err)
    }
    return null
  }
}

async function getQRCodeImage(qrCodeClass: IQRCodeManager) {
  try {
    const url = qrCodeClass.bitmapUrl + qrCodeClass.value

    const res = await beanfunClient.get(url, {
      responseType: "arraybuffer", // 重要！取得 Buffer
    })

    return Buffer.from(res.data) // Node.js Buffer
  } catch (err) {
    if (err instanceof Error) {
      console.error("getQRCodeImage error:", err.message)
    } else {
      console.log("Unknown error:", err)
    }

    return null
  }
}

async function getQRCodeStrEncryptData(skey: string) {
  // 1. Request JSON API
  const url = `https://tw.newlogin.beanfun.com/generic_handlers/get_qrcodeData.ashx?skey=${skey}`

  const res = await beanfunClient.get(url)

  // 2. Response JSON
  const jsonData = res.data

  // 3. Check intResult
  if (!jsonData.intResult || jsonData.intResult !== 1) {
    throw new Error("LoginIntResultError")
  }

  // 4. Return strEncryptData
  return jsonData.strEncryptData
}

async function postQRCodeCheckLoginStatus(
  qrcodeclass: QRCodeManagerType
): Promise<"Failed" | "Token Expired" | "Success" | -1> {
  try {
    const skey = qrcodeclass
    const payload = new URLSearchParams()
    payload.append("status", qrcodeclass.value)
    console.log("payload: ", payload.toString())

    const response = await beanfunClient.post(
      `https://tw.newlogin.beanfun.com/generic_handlers/CheckLoginStatus.ashx`,
      payload.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: `https://tw.newlogin.beanfun.com/login/qr_form.aspx?skey=${skey}`,
        },
        timeout: 5000, // 可選，避免卡住
      }
    )

    let jsonData
    try {
      jsonData = response.data
      // Axios 會自動 parse JSON，但確保型別
      if (typeof jsonData === "string") {
        jsonData = JSON.parse(jsonData)
      }
    } catch {
      console.error("LoginJsonParseFailed")
      return -1
    }

    const result: string = jsonData["ResultMessage"]
    console.log(result)

    if (result === "Failed") return "Failed"
    if (result === "Token Expired") return "Token Expired"
    if (result === "Success") return "Success"

    console.error("Unknown response:", jsonData)
    return -1
  } catch (err: any) {
    console.error("Network Error on QRCode checking login status", err.message)
    return -1
  }
}

async function postQRCodeLogin(
  qrcodeclass: QRCodeManagerType,
  serviceCode = "610074",
  serviceRegion = "T9"
) {
  const skey: string = qrcodeclass.skey
  // console.log("skey: ", skey)

  // 設定 Referer
  const headers = {
    Referer: `https://tw.newlogin.beanfun.com/login/qr_form.aspx?skey=${skey}`,
  }

  // 1. GET qr_step2.aspx?skey=xxx （不自動 redirect）
  const step2Res = await beanfunClient.get(
    `https://tw.newlogin.beanfun.com/login/qr_step2.aspx?skey=${skey}`,
    {
      maxRedirects: 0, // 重要：不要自動 redirect
    }
  )

  // 2. 從 Location 或 response 抓 akey + authkey
  let akey = ""
  let authkey = ""
  const location = step2Res.headers.location || step2Res.config.url || ""
  const akeyMatch = location.match(/akey=([^&]+)/)
  const authkeyMatch = location.match(/authkey=([^&]+)/)

  if (akeyMatch && authkeyMatch) {
    akey = akeyMatch[1]
    authkey = authkeyMatch[1]
  } else {
    // 可能在 response body 裡，照 C# regex 抓
    const bodyMatch = step2Res.data.match(/akey=([^&]+)&authkey=([^&]+)/)
    if (bodyMatch) {
      akey = bodyMatch[1]
      authkey = bodyMatch[2]
    }
  }

  if (!akey || !authkey) {
    throw new Error("AKeyParseFailed")
  }

  // console.log("Got akey:", akey.slice(0, 8), "authkey:", authkey.slice(0, 8))

  // 3. GET final_step.aspx?akey=...&authkey=...&bfapp=1 (//? test)
  const testRes = await beanfunClient.get(
    `https://tw.newlogin.beanfun.com/login/final_step.aspx?akey=${akey}&authkey=${authkey}&bfapp=1`,
    { headers }
  )

  const beanfunHost = "tw.beanfun.com"
  // 4. POST beanfun_block/bflogin/return.aspx
  const returnPayload = new URLSearchParams({
    SessionKey: skey,
    AuthKey: akey,
    ServiceCode: "",
    ServiceRegion: "",
    ServiceAccountSN: "0",
  })

  const returnRes = await beanfunClient.post(
    `https://${beanfunHost}/beanfun_block/bflogin/return.aspx`,
    returnPayload.toString(),
    {
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )

  // 5. GET Location 指向的頁面（取得 bfWebToken cookie）
  // console.log("returnRes: ", returnRes)
  // const returnLocation = returnRes.headers.location
  // if (!returnLocation) throw new Error("NoLocationHeader")

  const finalRes = await beanfunClient.get(
    // `https://${beanfunHost}/${returnLocation}`,
    `https://${beanfunHost}`,
    {
      headers,
    }
  )

  // 6. 從 cookie 取出 bfWebToken
  const beanfunCookies = await returnRes.config.jar?.getCookies(
    `https://${beanfunHost}`
  )
  const bfWebToken = beanfunCookies?.find((c) => c.key === "bfWebToken")?.value

  // console.log("bfWebToken: ", bfWebToken)

  // 7. 取得帳號列表
  const accouts = await getAccounts(bfWebToken, serviceCode, serviceRegion)
  // console.log("accouts: ", accouts)

  return accouts
}

export {
  getQRCodeImage,
  getQRCodeValue,
  getSessionKey,
  postQRCodeCheckLoginStatus,
  postQRCodeLogin,
}
