import { GetAccountsResult, ServiceAccount } from "./backend/services/account"
import { IpcResponse } from "./types/response"

export {}

// 定義全域型別
declare global {
  interface Window {
    api: {
      getQRCode: () => Promise<IpcResponse<BlobPart>>
      getQRCodeStatus: () => Promise<IpcResponse<Number>>
      postQRCodeLogin: () => Promise<IpcResponse<GetAccountsResult>>
      getOtp: (serviceAccount: ServiceAccount) => Promise<IpcResponse>
    }
    win: {
      info: () => void
      minimize: () => void
      maximize: () => void
      close: () => void
    }
  }
}
