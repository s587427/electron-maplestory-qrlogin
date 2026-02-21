import { BrowserWindow, session } from "electron"
import { IQRCodeManager, QRCodeManagerType } from "../classes/QRCodeManager"
import { getAccounts } from "./account"
import { beanfunFetch } from "./request"

async function getSessionKey(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    try {
      const win = new BrowserWindow({
        show: false, // 不顯示畫面
      })

      win.loadURL(
        "https://tw.beanfun.com/beanfun_block/bflogin/default.aspx?service=999999_T0"
      )

      win.webContents.on("did-navigate", async (e, url) => {
        const response = await beanfunFetch(url)
        // const html = await response.text()
        const parsed = new URL(url)
        const skey = parsed.searchParams.get("skey")
        win.destroy()
        resolve(skey)
      })
    } catch (error) {
      console.log("getSessionKey error: ", error)
      resolve(null)
    }
  })
}

async function getQRCodeValue(skey: string) {
  try {
    // 1. Download HTML response

    const response = await beanfunFetch(
      `https://tw.newlogin.beanfun.com/login/qr_form.aspx?skey=${skey}`
    )
    const htmlStr = await response.text()

    // 2. Extract __VIEWSTATE
    let regex = /id="__VIEWSTATE" value="(.*)" \/>/

    if (!regex.test(htmlStr)) {
      throw new Error("LoginNoViewstate")
    }

    const viewstate = htmlStr.match(regex)[1]

    // 3. Extract __EVENTVALIDATION
    regex = /id="__EVENTVALIDATION" value="(.*)" \/>/

    if (!regex.test(htmlStr)) {
      throw new Error("LoginNoEventvalidation")
    }

    const eventvalidation = htmlStr.match(regex)[1]

    // 4. Extract QR Code Hash Path
    regex =
      /\$\("#theQrCodeImg"\)\.attr\("src", "\.\.\/(.*)" \+ obj\.strEncryptData\);/

    if (!regex.test(htmlStr)) {
      throw new Error("LoginNoHash")
    }

    const value = htmlStr.match(regex)[1]

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

    const response = await beanfunFetch(url)
    const arraybuffer = await response.arrayBuffer()

    return Buffer.from(arraybuffer) // Node.js Buffer
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
  const response = await beanfunFetch(
    `https://tw.newlogin.beanfun.com/generic_handlers/get_qrcodeData.ashx?skey=${skey}`
  )
  const jsonData = await response.json()

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

    const response = await beanfunFetch(
      `https://tw.newlogin.beanfun.com/generic_handlers/CheckLoginStatus.ashx`,
      {
        referrer: `https://tw.newlogin.beanfun.com/login/qr_form.aspx?skey=${skey}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: payload.toString(),
      }
    )

    const jsonData = await response.json()

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

  const referrer = `https://tw.newlogin.beanfun.com/login/qr_form.aspx?skey=${skey}`

  // 1. GET qr_step2.aspx?skey=xxx （不自動 redirect）
  const step2Response = await beanfunFetch(
    `https://tw.newlogin.beanfun.com/login/qr_step2.aspx?skey=${skey}`,
    {
      referrer,
      redirect: "manual",
    }
  )

  const htmlStr = await step2Response.text()

  // 2. 從 response 抓 akey + authkey
  let akey = ""
  let authkey = ""
  // console.log("可能在 response body 裡，照 C# regex 抓")
  const bodyMatch = htmlStr.match(/akey=([^&]+)&authkey=([^&]+)/)
  if (bodyMatch) {
    akey = bodyMatch[1]
    authkey = bodyMatch[2]
  }

  if (!akey || !authkey) {
    throw new Error("AKeyParseFailed")
  }

  // console.log("akey: ", akey, "authKey: ", authkey)

  // 3. GET final_step.aspx?akey=...&authkey=...&bfapp=1 (//? test)
  const testRes = await beanfunFetch(
    `https://tw.newlogin.beanfun.com/login/final_step.aspx?akey=${akey}&authkey=${authkey}&bfapp=1`,
    { referrer }
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

  try {
    const returnResponse = await beanfunFetch(
      `https://${beanfunHost}/beanfun_block/bflogin/return.aspx`,
      {
        referrer,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: returnPayload.toString(),
      }
    )
  } catch (err) {
    console.log("POST beanfun_block/bflogin/return.aspx error")
  }

  const finalResponse = await beanfunFetch(`https://${beanfunHost}`, {
    referrer,
  })

  // 4. 從 cookie 取出 bfWebToken
  const beanfunCookies = await session.defaultSession.cookies.get({
    url: `https://tw.beanfun.com`,
  })

  const bfWebToken = beanfunCookies.find(
    (cookie) => cookie.name === "bfWebToken"
  )?.value

  // console.log("bfWebToken: ", bfWebToken)

  // 5. 取得帳號列表
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
