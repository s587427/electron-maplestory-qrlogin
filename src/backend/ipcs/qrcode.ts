import {
  IPC_AUTH_SIGN_IN_QRCODE,
  IPC_QRCODE_CHECK_STATUS,
  IPC_QRCODE_GET,
} from "@/const"
import { IpcResponse } from "@/types/response"
import { ipcMain } from "electron"
import { qrcodeManager, QRCodeStatus } from "../classes/QRCodeManager"
import { GetAccountsResult, getInitLogin } from "../services/auth"
import { getQRCodeLogin, getQRCodeLoginWebInfo } from "../services/qrcode"

export type InitLoginData = { qrImage: string; deepLink: string }

ipcMain.handle(
  IPC_QRCODE_GET,
  async (): Promise<IpcResponse<InitLoginData>> => {
    const QRCodeLoginWebInfo = await getQRCodeLoginWebInfo()
    if (QRCodeLoginWebInfo == null) {
      return { error: true, message: "beanfun server error" }
    }

    const { skey, requestVerificationToken } = QRCodeLoginWebInfo

    const initLoginData = await getInitLogin(skey)
    // console.log({ initLoginData })
    const {
      QRImage,
      IsHK,
      IsRecaptcha,
      RecaptchaV2PublicKey,
      IsOTP,
      DeepLink,
    } = initLoginData.ResultData

    qrcodeManager.skey = skey
    qrcodeManager.requestVerificationToken = requestVerificationToken

    // 新版改成base64
    return {
      message: "success",
      data: { qrImage: QRImage, deepLink: DeepLink },
    }
  }
)

ipcMain.handle(
  IPC_QRCODE_CHECK_STATUS,
  async (): Promise<IpcResponse<QRCodeStatus>> => {
    try {
      const resultInt = await qrcodeManager.checkLoingStatus()
      return { message: "success", data: resultInt }
    } catch (err) {
      console.log("get:qrcodeStatus: ", err)
      return { error: true, message: "error" }
    }
  }
)

ipcMain.handle(
  IPC_AUTH_SIGN_IN_QRCODE,
  async (): Promise<IpcResponse<GetAccountsResult>> => {
    try {
      const accountList = await getQRCodeLogin(qrcodeManager)
      return { message: "success", data: accountList }
    } catch (error) {
      return { error: true, message: error.message }
    }
  }
)
