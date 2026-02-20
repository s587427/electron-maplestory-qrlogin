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
    }
    win: {
      info: () => void
      minimize: () => void
      maximize: () => void
      close: () => void
    }
  }
}
