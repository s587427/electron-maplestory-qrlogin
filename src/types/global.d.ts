import { InitLoginData } from "@/backend/ipcs/qrcode"
import { GetAccountsResult, ServiceAccount } from "./backend/services/account"
import { IpcResponse } from "./response"

export {}

// 定義全域型別
declare global {
  interface Window {
    app: {
      version: string
    }
    api: {
      getQRCode: () => Promise<IpcResponse<InitLoginData>>
      getQRCodeStatus: () => Promise<IpcResponse<QRCodeStatus>>
      getOtp: (serviceAccount: ServiceAccount) => Promise<IpcResponse>
      signIn: () => Promise<IpcResponse<GetAccountsResult>>
      signOut: () => Promise<IpcResponse<boolean>>
      pinToken: () => Promise<IpcResponse<string>>
      openExternal: (url: string) => Promise<void>
      autoLogin: (account: string, password: string) => void
    }
    win: {
      info: () => void
      minimize: () => void
      maximize: () => void
      close: () => void
    }
    store: {
      get: <T = unknown>(key: string) => Promise<T>
      set: (key: string, value: unknown) => Promise<void>
    }
  }
}
