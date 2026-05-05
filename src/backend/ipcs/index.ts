export async function registerIpcs() {
  await import("./window")
  await import("./auth")
  await import("./chore")
  await import("./qrcode")
}
