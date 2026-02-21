import { beanfunFetch } from "../services/request"

export type QRCodeStatus = -2 | -1 | 0 | 1

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

  async checkLoingStatus(): Promise<QRCodeStatus> {
    try {
      const { skey, value } = this

      // POST payload
      const payload = new URLSearchParams()
      payload.append("status", value)

      const response = await beanfunFetch(
        "https://tw.newlogin.beanfun.com/generic_handlers/CheckLoginStatus.ashx",
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
      console.log("QR Check result:", result)

      if (result === "Failed") return 0
      if (result === "Token Expired") return -2
      if (result === "Success") return 1

      console.error(JSON.stringify(jsonData))
      return -1
    } catch (err: any) {
      console.error(
        "Network Error on QRCode checking login status" + err.message
      )
      return -1
    }
  }
}

export const qrcodeManager = new QRCodeManager()

export type QRCodeManagerType = QRCodeManager
