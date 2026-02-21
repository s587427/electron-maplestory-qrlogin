import { GetAccountsResult, ServiceAccount } from "./backend/services/account"
import { IpcResponse } from "./response"

export {}

// 定義全域型別
declare global {
  interface Window {
    api: {
      getQRCode: () => Promise<IpcResponse<BlobPart | undefined>>
      getQRCodeStatus: () => Promise<IpcResponse<QRCodeStatus>>
      postQRCodeLogin: () => Promise<IpcResponse<GetAccountsResult>>
      getOtp: (serviceAccount: ServiceAccount) => Promise<IpcResponse>
      signOut: () => Promise<IpcResponse<boolean>>
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
