import axios from "axios"

export interface IQRCodeManager {
  skey: string
  viewstate: string
  eventvalidation: string
  value: string
  bitmapUrl: string
}

class QRCodeManager implements IQRCodeManager {
  skey: string
  viewstate: string
  eventvalidation: string
  value: string
  bitmapUrl: string

  constructor() {
    this.skey = ""
    this.viewstate = ""
    this.eventvalidation = ""
    this.value = ""
    this.bitmapUrl = ""
  }

  async checkLoingStatus() {
    try {
      const { skey, value } = this

      // POST payload
      const payload = new URLSearchParams()
      payload.append("status", value)

      const response = await axios.post(
        "https://tw.newlogin.beanfun.com/generic_handlers/CheckLoginStatus.ashx",
        payload.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Referer: `https://tw.newlogin.beanfun.com/login/qr_form.aspx?skey=${skey}`,
          },
          timeout: 5000,
        },
      )

      // 解析 JSON
      let jsonData: any
      try {
        jsonData =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data
      } catch {
        console.error("LoginJsonParseFailed")
        return -1
      }

      const result: string = jsonData["ResultMessage"]
      console.log("QR Check result:", result)

      if (result === "Failed") return 0
      if (result === "Token Expired") return -2
      if (result === "Success") return 1

      console.error(JSON.stringify(jsonData))
      return -1
    } catch (err: any) {
      console.error(
        "Network Error on QRCode checking login status" + err.message,
      )
      return -1
    }
  }
}

export const qrcodeManager = new QRCodeManager()

// let instance: QRCodeManager | null = null

// export default function getQRCodeManager() {
//   if (!instance) {
//     instance = new QRCodeManager()
//   }
//   return instance
// }

export type QRCodeManagerType = QRCodeManager
