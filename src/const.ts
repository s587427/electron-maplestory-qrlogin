// domain:action kebab-case

// auth
export const IPC_AUTH_SIGN_IN_QRCODE = "auth:sign-in-qrcode"
export const IPC_AUTH_SIGN_OUT = "auth:sign-out"
export const IPC_AUTH_GET_OTP = "auth:get-otp"
export const IPC_AUTH_PING_TOKEN = "auth:ping-token"

// qrcode
export const IPC_QRCODE_GET = "qrcode:get"
export const IPC_QRCODE_CHECK_STATUS = "qrcode:check-status"

// window
export const IPC_WINDOW_INFO = "window:get-info"
export const IPC_WINDOW_MINIMIZE = "window:minimize"
export const IPC_WINDOW_MAXIMIZE = "window:maximize"
export const IPC_WINDOW_CLOSE = "window:close"

// store
export const IPC_STORE_GET = "store:get"
export const IPC_STORE_SET = "store:set"

// system
export const IPC_SYSTEM_OPEN_EXTERNAL = "system:open-external"
export const IPC_SYSTEM_AUTO_LOGIN = "system:auto-login"

export const STORE_PRE_SELECT_ACCOUNT_ID = "preSelectAccountId"
export const STORE_IS_AUTO_FILL = "isAutoFill"

export const VK = {
  TAB: 0x09,
  BACK: 0x08,
  CONTROL: 0x11,
  LCONTROL: 0xa2,
  SHIFT: 0x10,
  ALT: 0x12,
  Enter: 0x0d,
  V: 0x56,
  C: 0x43,
  A: 0x41,
}
