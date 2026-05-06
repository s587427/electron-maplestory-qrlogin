import { execSync } from "child_process"
export function setClipboard(text: string) {
  try {
    const escapedText = text.replace(/'/g, "''")
    execSync(
      `powershell -NoProfile -Command "Set-Clipboard -Value '${escapedText}'"`
    )
  } catch (err) {
    console.error("無法寫入剪貼簿:", err)
  }
}
