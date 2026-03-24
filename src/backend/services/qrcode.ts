import { BrowserWindow, session } from "electron"
import { IQRCodeManager, QRCodeManagerType } from "../classes/QRCodeManager"
import { getAccounts } from "./auth"
import { beanfunFetch } from "./request"

async function getSessionKey(): Promise<string | null> {
  const redirectCount = 2
  return new Promise((resolve, reject) => {
    try {
      let c = 0
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
        // console.log("url: ", url)
        c = c + 1
        if (c === redirectCount) {
          const skey = parsed.searchParams.get("pSKey")
          resolve(skey)
          win.destroy()
        }
      })
    } catch (error) {
      console.log("getSessionKey error: ", error)
      resolve(null)
    }
  })
}

// ! deprecated
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

// ! deprecated
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

// ! deprecated
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

async function getQRCodeLogin(
  qrcodeclass: QRCodeManagerType,
  serviceCode = "610074",
  serviceRegion = "T9"
) {
  const skey = qrcodeclass.skey
  const referrer = `https://login.beanfun.com/Login/Index?pSKey=${skey}`

  const qrLoginResponse = await beanfunFetch(
    `https://login.beanfun.com/QRLogin/QRLogin`,
    {
      referrer,
    }
  )

  const qrLoginJson = await qrLoginResponse.json()

  // sendLogin.aspx
  const sendLoginResponse = await beanfunFetch(
    `https://login.beanfun.com/Login/SendLogin`,
    { referrer }
  )
  const sendLoginHtml = await sendLoginResponse.text()

  const parseSendLoginHtml = () => {
    // \b確保是完整單詞
    // [^>]* 「不是 > 的任意字元，出現 0 次以上
    const inputMatches = sendLoginHtml.matchAll(/<input\b[^>]*>/gi)
    const params = new URLSearchParams()

    for (const inputMatch of inputMatches) {
      const tag = inputMatch[0]

      let name = null
      let value = ""

      // ["']引號或雙引號
      // ([^"']*) 不是號或雙引號的任意字元，出現 0 次以上
      // g全域搜尋
      // i忽略大小寫
      const attrMatches = tag.matchAll(/\b(name|value)=["']([^"']*)["']/gi)

      for (const attrMatch of attrMatches) {
        if (attrMatch[1] === "name") name = attrMatch[2]
        if (attrMatch[1] === "value") value = attrMatch[2]
      }

      if (name !== null) {
        params.append(name, value)
      }
    }
    return params
  }

  const beanfunHost = "tw.beanfun.com"

  // beanfun_block/bflogin/return.aspx  response header will set webtoken cookie
  try {
    const returnResponse = await beanfunFetch(
      `https://${beanfunHost}/beanfun_block/bflogin/return.aspx`,
      {
        referrer: "https://login.beanfun.com/",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: parseSendLoginHtml(),
        // redirect: "manual",
      }
    )
  } catch (err) {
    console.log("POST beanfun_block/bflogin/return.aspx error")
  }

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

export { getQRCodeLogin, getSessionKey }
