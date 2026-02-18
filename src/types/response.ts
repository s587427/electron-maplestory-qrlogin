export type IpcResponse<T = any> = {
  error?: boolean
  message: string
  data?: T
}
