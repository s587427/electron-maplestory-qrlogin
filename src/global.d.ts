import { GetAccountsResult, ServiceAccount } from "./backend/services/account"
import { IpcResponse } from "./types/response"

export {}
declare global {
  interface Window {
    versions: {
      node: string
    }
    api: {
      getQRCode: () => Promise<IpcResponse<BlobPart>>
      getQRCodeStatus: () => Promise<IpcResponse<Number>>
      postQRCodeLogin: () => Promise<IpcResponse<GetAccountsResult>>
      getOtp: (serviceAccount: ServiceAccount) => Promise<IpcResponse>
    }
  }
}
