// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron"
import pkg from "../package.json"
import { ServiceAccount } from "./backend/services/auth"
import {
  IPC_AUTH_GET_OTP,
  IPC_AUTH_PING_TOKEN,
  IPC_AUTH_SIGN_IN_QRCODE,
  IPC_AUTH_SIGN_OUT,
  IPC_QRCODE_CHECK_STATUS,
  IPC_QRCODE_GET,
  IPC_STORE_GET,
  IPC_STORE_SET,
  IPC_SYSTEM_AUTO_LOGIN,
  IPC_SYSTEM_OPEN_EXTERNAL,
  IPC_WINDOW_CLOSE,
  IPC_WINDOW_INFO,
  IPC_WINDOW_MAXIMIZE,
  IPC_WINDOW_MINIMIZE,
} from "./const"
// invoke return Promise
// on void

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"),
  // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld("app", {
  version: pkg.version,
})

contextBridge.exposeInMainWorld("api", {
  getQRCode: () => ipcRenderer.invoke(IPC_QRCODE_GET),
  getQRCodeStatus: () => ipcRenderer.invoke(IPC_QRCODE_CHECK_STATUS),
  signIn: () => ipcRenderer.invoke(IPC_AUTH_SIGN_IN_QRCODE),
  signOut: () => ipcRenderer.invoke(IPC_AUTH_SIGN_OUT),
  getOtp: (serviceAccount: ServiceAccount) =>
    ipcRenderer.invoke(IPC_AUTH_GET_OTP, serviceAccount),
  pinToken: () => ipcRenderer.invoke(IPC_AUTH_PING_TOKEN),
  openExternal: (url: string) =>
    ipcRenderer.invoke(IPC_SYSTEM_OPEN_EXTERNAL, url),
  autoLogin: (account: string, password: string) =>
    ipcRenderer.send(IPC_SYSTEM_AUTO_LOGIN, account, password),
})

contextBridge.exposeInMainWorld("win", {
  info: () => ipcRenderer.send(IPC_WINDOW_INFO),
  minimize: () => ipcRenderer.send(IPC_WINDOW_MINIMIZE),
  maximize: () => ipcRenderer.send(IPC_WINDOW_MAXIMIZE),
  close: () => ipcRenderer.send(IPC_WINDOW_CLOSE),
})

contextBridge.exposeInMainWorld("store", {
  get: (key: string) => ipcRenderer.invoke(IPC_STORE_GET, key),
  set: (key: string, value: unknown) =>
    ipcRenderer.invoke(IPC_STORE_SET, key, value),
})
