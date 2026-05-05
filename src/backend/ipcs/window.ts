import {
  IPC_WINDOW_CLOSE,
  IPC_WINDOW_INFO,
  IPC_WINDOW_MAXIMIZE,
  IPC_WINDOW_MINIMIZE,
} from "@/const"
import { BrowserWindow, ipcMain } from "electron"

ipcMain.on(IPC_WINDOW_INFO, (event) => {
  console.log("click info btn from client")
})

ipcMain.on(IPC_WINDOW_MINIMIZE, (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})

ipcMain.on(IPC_WINDOW_CLOSE, (event) => {
  BrowserWindow.fromWebContents(event.sender)?.hide()
  // BrowserWindow.fromWebContents(event.sender)?.close()
})

ipcMain.on(IPC_WINDOW_MAXIMIZE, (event) => {
  console.log("click maximize btn from client")
  // const win = BrowserWindow.fromWebContents(event.sender)
  // if (!win) return
  // win.isMaximized() ? win.unmaximize() : win.maximize()
})
