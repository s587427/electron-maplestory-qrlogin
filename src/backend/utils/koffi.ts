import { app } from "electron"
import type * as koffiType from "koffi"
import path from "path"

const modulePath = app.isPackaged
  ? path.join(process.resourcesPath, "koffi")
  : "koffi"

const koffi = require(modulePath) as typeof koffiType

// 1. 載入 DLL
const user32 = koffi.load("user32.dll")

// 2. 定義 Win32 類型別名 (讓代碼更接近 C 語言，增加可讀性)
const HWND = koffi.alias("HWND", "void *")
const BOOL = koffi.alias("BOOL", "int")
const DWORD = koffi.alias("DWORD", "uint32")
const UINT = koffi.alias("UINT", "uint32")
const WORD = koffi.alias("WORD", "uint16")
const LONG = koffi.alias("LONG", "int32")
const ULONG_PTR = koffi.alias("ULONG_PTR", "uintptr_t")

// 3. 定義結構 (Struct)
const MOUSEINPUT = koffi.struct("MOUSEINPUT", {
  dx: LONG,
  dy: LONG,
  mouseData: DWORD,
  dwFlags: DWORD,
  time: DWORD,
  dwExtraInfo: ULONG_PTR,
})

const KEYBDINPUT = koffi.struct("KEYBDINPUT", {
  wVk: WORD,
  wScan: WORD,
  dwFlags: DWORD,
  time: DWORD,
  dwExtraInfo: ULONG_PTR,
})

const HARDWAREINPUT = koffi.struct("HARDWAREINPUT", {
  uMsg: DWORD,
  wParamL: WORD,
  wParamH: WORD,
})

// 4. 定義聯集 (Union) - Koffi 原生支援，不需要外部庫
const INPUT_UNION = koffi.union("INPUT_UNION", {
  mi: MOUSEINPUT,
  ki: KEYBDINPUT,
  hi: HARDWAREINPUT,
})

const INPUT = koffi.struct("INPUT", {
  type: DWORD, // 0:滑鼠, 1:鍵盤, 2:硬體
  u: INPUT_UNION,
})

// 5. 宣告函式 (使用 __stdcall 是 Windows API 的標準)
// 注意：Koffi 支援 'char16' 類型，會自動處理 JavaScript 字串轉 Unicode，不需要 toUnicode 函式了
const FindWindowW = user32.func(
  "HWND __stdcall FindWindowW(const char16 *lpClassName, const char16 *lpWindowName)"
)
const SetForegroundWindow = user32.func(
  "BOOL __stdcall SetForegroundWindow(HWND hWnd)"
)
const ShowWindow = user32.func(
  "BOOL __stdcall ShowWindow(HWND hWnd, int nCmdShow)"
)
const SendInput = user32.func(
  "UINT __stdcall SendInput(UINT cInputs, INPUT *pInputs, int cbSize)"
)
const MapVirtualKeyW = user32.func(
  "UINT __stdcall MapVirtualKeyW(UINT uCode, UINT uMapType)"
)

// 常數定義
const SW_RESTORE = 9
const INPUT_KEYBOARD = 1
const KEYEVENTF_KEYUP = 0x0002
const KEYEVENTF_SCANCODE = 0x0008

/**
 * 模擬按鍵
 */
async function pressKeys(vkCodes: number[], delay = 50) {
  const inputs = []

  // 1. 準備按下動作 (使用 JS 對象，Koffi 會自動轉換為 C 結構)
  for (const vk of vkCodes) {
    const scanCode = MapVirtualKeyW(vk, 0)
    inputs.push({
      type: INPUT_KEYBOARD,
      u: {
        ki: {
          wVk: vk,
          wScan: scanCode,
          dwFlags: KEYEVENTF_SCANCODE,
          time: 0,
          dwExtraInfo: 0,
        },
      },
    })
  }

  // 2. 準備放開動作
  for (const vk of [...vkCodes].reverse()) {
    const scanCode = MapVirtualKeyW(vk, 0)
    inputs.push({
      type: INPUT_KEYBOARD,
      u: {
        ki: {
          wVk: vk,
          wScan: scanCode,
          dwFlags: KEYEVENTF_SCANCODE | KEYEVENTF_KEYUP,
          time: 0,
          dwExtraInfo: 0,
        },
      },
    })
  }

  const pressInputs = inputs.slice(0, vkCodes.length)
  const releaseInputs = inputs.slice(vkCodes.length)

  // 執行按下
  // 不需要 Buffer.alloc，直接傳陣列，Koffi 處理一切
  SendInput(pressInputs.length, pressInputs, koffi.sizeof(INPUT))

  if (delay > 0) await new Promise((r) => setTimeout(r, delay))

  // 執行放開
  SendInput(releaseInputs.length, releaseInputs, koffi.sizeof(INPUT))
}

export const win = {
  // FindWindowW 現在直接傳字串即可，不需要 Buffer
  findWindow: (title: string): string | null => FindWindowW(null, title),
  setForegroundWindow: (hwnd: string): boolean => SetForegroundWindow(hwnd),
  showWindow: (hwnd: string): boolean => ShowWindow(hwnd, SW_RESTORE),
  pressKeys,
}
