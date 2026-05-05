import { IPC_STORE_GET, IPC_STORE_SET, IPC_SYSTEM_OPEN_EXTERNAL } from "@/const"
import { ipcMain, shell } from "electron"
import Store from "electron-store"

const store = new Store()

ipcMain.handle(IPC_STORE_GET, async (event, key: string) => {
  return store.get(key)
})
ipcMain.handle(IPC_STORE_SET, async (event, key: string, value: unknown) => {
  store.set(key, value)
})

ipcMain.handle(IPC_SYSTEM_OPEN_EXTERNAL, (_, url: string) =>
  shell.openExternal(url)
)
