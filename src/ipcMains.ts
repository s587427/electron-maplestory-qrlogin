import { BrowserWindow, ipcMain, shell } from "electron"
import Store from "electron-store"
import { qrcodeManager, QRCodeStatus } from "./backend/classes/QRCodeManager"
import {
  GetAccountsResult,
  getInitLogin,
  getOTP,
  pingToken,
  ServiceAccount,
  signOut,
} from "./backend/services/auth"
import { getQRCodeLogin, getSessionKey } from "./backend/services/qrcode"
import { IpcResponse } from "./types/response"

const store = new Store()
//  console.log(stroe.path)

export async function registerIpcMains() {
  // ons

  ipcMain.on("window:info", (event) => {
    console.log("click info btn from client")
  })

  ipcMain.on("window:minimize", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.on("window:close", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.hide()
    // BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.on("window:maximize", (event) => {
    console.log("click maximize btn from client")
    // const win = BrowserWindow.fromWebContents(event.sender)
    // if (!win) return
    // win.isMaximized() ? win.unmaximize() : win.maximize()
  })

  // handles
  ipcMain.handle("openExternal", (_, url: string) => shell.openExternal(url))

  ipcMain.handle(
    "get:qrcode",
    async (): Promise<IpcResponse<string | undefined>> => {
      const skey = await getSessionKey()
      // const qrcodeValue = await getQRCodeValue(skey)
      // if (qrcodeValue == null) {
      //   return { error: true, message: "beanfun server error" }
      // }
      const initLoginData = await getInitLogin(skey)
      const {
        QRImage,
        IsHK,
        IsRecaptcha,
        RecaptchaV2PublicKey,
        IsOTP,
        DeepLink,
      } = initLoginData.ResultData

      qrcodeManager.skey = skey
      // qrcodeManager.viewstate = qrcodeValue.viewstate
      // qrcodeManager.bitmapUrl = qrcodeValue.bitmapUrl
      // qrcodeManager.eventvalidation = qrcodeValue.eventvalidation
      // qrcodeManager.value = qrcodeValue.value

      // 新版改成base64
      // const arraybuffer = await getQRCodeImage(qrcodeManager)
      return { message: "success", data: QRImage }
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
        const accountList = await getQRCodeLogin(qrcodeManager)
        return { message: "success", data: accountList }
      } catch (error) {
        return { error: true, message: error.message }
      }
    }
  )

  ipcMain.handle("sign-out", async (): Promise<IpcResponse<boolean>> => {
    const result = await signOut()
    return {
      message: result ? "signout successful" : "signout failed",
      data: result,
    }
  })

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

  ipcMain.handle(
    "get:pinToken",
    async (ipcMainInvokeEvent): Promise<IpcResponse> => {
      try {
        // console.log("getOTP: ", serviceAccount)
        const res = await pingToken()
        return { message: "success", data: res }
      } catch (error) {
        if (error instanceof Error) {
          return { error: true, message: error.message }
        }
        return { error: true, message: "unknown error" }
      }
    }
  )

  ipcMain.handle("stroe:get", async (event, key: string) => {
    return store.get(key)
  })
  ipcMain.handle("stroe:set", async (event, key: string, value: unknown) => {
    store.set(key, value)
  })
}
