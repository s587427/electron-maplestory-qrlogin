import { BrowserWindow, ipcMain } from "electron"
import { qrcodeManager, QRCodeStatus } from "./backend/classes/QRCodeManager"
import {
  GetAccountsResult,
  getOTP,
  ServiceAccount,
} from "./backend/services/account"
import {
  getQRCodeImage,
  getQRCodeValue,
  getSessionKey,
  postQRCodeLogin,
} from "./backend/services/login"
import { IpcResponse } from "./types/response"

export async function registerIpcMains() {
  // ons

  ipcMain.on("window:info", (event) => {
    console.log("click info btn from client")
  })

  ipcMain.on("window:minimize", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.on("window:close", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.on("window:maximize", (event) => {
    console.log("click maximize btn from client")
    // const win = BrowserWindow.fromWebContents(event.sender)
    // if (!win) return
    // win.isMaximized() ? win.unmaximize() : win.maximize()
  })

  // handles
  ipcMain.handle(
    "get:qrcode",
    async (): Promise<IpcResponse<Buffer | undefined>> => {
      const skey = await getSessionKey()
      const qrcodeValue = await getQRCodeValue(skey)

      if (qrcodeValue == null) {
        return { error: true, message: "beanfun server error" }
      }

      qrcodeManager.skey = qrcodeValue.skey
      qrcodeManager.viewstate = qrcodeValue.viewstate
      qrcodeManager.bitmapUrl = qrcodeValue.bitmapUrl
      qrcodeManager.eventvalidation = qrcodeValue.eventvalidation
      qrcodeManager.value = qrcodeValue.value
      const arraybuffer = await getQRCodeImage(qrcodeManager)
      return { message: "success", data: arraybuffer }
    }
  )

  ipcMain.handle(
    "get:qrcodeStatus",
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
    "post:qrcodeLogin",
    async (): Promise<IpcResponse<GetAccountsResult>> => {
      try {
        const accountList = await postQRCodeLogin(qrcodeManager)
        return { message: "success", data: accountList }
      } catch (error) {
        return { error: true, message: error.message }
      }
    }
  )

  ipcMain.handle(
    "get:otp",
    async (
      ipcMainInvokeEvent,
      serviceAccount: ServiceAccount
    ): Promise<IpcResponse> => {
      try {
        // console.log("getOTP: ", serviceAccount)
        const res = await getOTP(serviceAccount)
        return { message: "success", data: res }
      } catch (error) {
        return { error: true, message: error.message }
      }
    }
  )
}
