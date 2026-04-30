import { beanfunFetch } from "../services/request"

export type QRCodeStatus = -2 | -1 | 0 | 1

export interface IQRCodeManager {
  skey: string
  requestVerificationToken: string
}

class QRCodeManager implements IQRCodeManager {
  skey: string
  requestVerificationToken: string

  constructor() {
    this.skey = ""
    this.requestVerificationToken = ""
  }

  async checkLoingStatus(): Promise<QRCodeStatus> {
    try {
      const { skey, requestVerificationToken } = this

      const response = await beanfunFetch(
        "https://login.beanfun.com/QRLogin/CheckLoginStatus",
        {
          referrer: `https://login.beanfun.com/Login/Index?pSKey=${skey}`,
          method: "POST",
          headers: {
            requestVerificationToken,
          },
        }
      )

      const responseJson = await response.json()

      // 新版check qrcode api response format
      // response
      //       {
      //     "Result": 0,
      //     "__APICheckFlag": "",
      //     "APIVersion": "1",
      //     "ErrorSeqNum": 0,
      //     "StatusCode": 0,
      //     "ResultCode": 2,
      //     "ResultMessageCode": 9999,
      //     "LogMessage": "Failed",
      //     "ResultMessage": "Failed"
      // }

      const result: string = responseJson["ResultMessage"]
      console.log("QR Check result:", result)

      if (result === "Failed") return 0
      if (result === "Token Expired") return -2
      if (result === "Success") return 1

      console.error(JSON.stringify(responseJson))
      return -1
    } catch (err: any) {
      console.log(err)
      console.error(
        "Network Error on QRCode checking login status" + err.message
      )
      return -1
    }
  }
}

export const qrcodeManager = new QRCodeManager()

export type QRCodeManagerType = QRCodeManager
