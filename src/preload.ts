// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron"
import { ServiceAccount } from "./backend/services/auth"

// invoke return Promise
// on void

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"),

  // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld("api", {
  getQRCode: () => ipcRenderer.invoke("get:qrcode"),
  getQRCodeStatus: () => ipcRenderer.invoke("get:qrcodeStatus"),
  postQRCodeLogin: () => ipcRenderer.invoke("post:qrcodeLogin"),
  signOut: () => ipcRenderer.invoke("sign-out"),
  getOtp: (serviceAccount: ServiceAccount) =>
    ipcRenderer.invoke("get:otp", serviceAccount),
  openExternal: (url: string) => ipcRenderer.invoke("openExternal", url),
})

contextBridge.exposeInMainWorld("win", {
  info: () => ipcRenderer.send("window:info"),
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
})

contextBridge.exposeInMainWorld("store", {
  get: (key: string) => ipcRenderer.invoke("stroe:get", key),
  set: (key: string, value: unknown) =>
    ipcRenderer.invoke("stroe:set", key, value),
})
