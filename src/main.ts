import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron"
import started from "electron-squirrel-startup"
import path from "node:path"
import { registerIpcMains } from "./ipcMains"

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
}

let mainWindow: BrowserWindow | null = null
// save a reference to the Tray object globally to avoid garbage collection
let tray: Tray | null = null

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 435,
    height: 328,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    resizable: false, // 不允許改變視窗大小
    titleBarStyle: "hidden",
    // titleBarOverlay: {
    //   color: "#acc6df",
    //   symbolColor: "#fff",
    //   height: 20,
    // },
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    )
  }

  if (app.isPackaged) {
    // Electron 預設 menu 有 DevTools 選項
    Menu.setApplicationMenu(null)
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // register ipc
  registerIpcMains()
  createWindow()
  createTray()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function createTray() {
  // 設定圖示路徑 (確保你有一個 ico 或 png 檔案)
  // 建議使用 16x16 或 32x32 的圖示
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets/icon.ico") // 打包後在 resources 根目錄
    : path.join(app.getAppPath(), "src/assets/icon.ico") // 開發模式指向 src
  // 👇 這段才是右下角 icon
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([{ role: "quit", label: "Quit" }])

  tray.setToolTip("MSQR-Code")
  tray.setContextMenu(contextMenu)

  tray.on("click", () => {
    mainWindow.show()
  })
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
