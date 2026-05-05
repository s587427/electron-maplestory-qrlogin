import {
  IPC_AUTH_GET_OTP,
  IPC_AUTH_PING_TOKEN,
  IPC_AUTH_SIGN_OUT,
} from "@/const"
import { IpcResponse } from "@/types/response"
import { ipcMain } from "electron"
import { getOTP, pingToken, ServiceAccount, signOut } from "../services/auth"

ipcMain.handle(IPC_AUTH_SIGN_OUT, async (): Promise<IpcResponse<boolean>> => {
  const result = await signOut()
  return {
    message: result ? "signout successful" : "signout failed",
    data: result,
  }
})

ipcMain.handle(
  IPC_AUTH_GET_OTP,
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
  IPC_AUTH_PING_TOKEN,
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
