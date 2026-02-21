import { QRCodeStatus } from "@/backend/classes/QRCodeManager"
import { useAuth } from "@/frontend/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import "./index.css"

const mapQRCodeStatusMsg: Record<QRCodeStatus, string> = {
  "-2": "Token Expired",
  "-1": "LoginJsonParseFailed | Unknow Result Error",
  "0": "Failed",
  "1": "Success",
}

export function QRCodeLoingPage() {
  const navigate = useNavigate()

  const [isLoading, setIsloading] = useState<boolean>(true)
  const [qrcodeBolb, setQRCodBlob] = useState<BlobPart>(null)
  const [qrcodeStatusState, setQRCodeStatusState] = useState<QRCodeStatus>(-1) // -1 default -2 expired  1 pass
  const refreshImgSrc = "https://tw.newlogin.beanfun.com/images/refresh.png"

  const [imgSrc, setImgSrc] = useState(refreshImgSrc)
  const { signIn } = useAuth()

  useEffect(() => {
    updateQRCodeBlob()
  }, [])

  useEffect(() => {
    let clearTimerFn = null
    if (qrcodeBolb) {
      const blob = new Blob([qrcodeBolb], { type: "image/png" })
      const imageUrl = URL.createObjectURL(blob)
      setImgSrc(imageUrl)

      // start check login status
      clearTimerFn = checkQRCodeLoginStatusTimer()
    }
    return () => {
      if (clearTimerFn) {
        clearTimerFn()
      }
    }
  }, [qrcodeBolb])

  useEffect(() => {
    if (qrcodeStatusState === 1) {
      signIn()
    }
  }, [qrcodeStatusState])

  function checkQRCodeLoginStatusTimer() {
    let timer: null | NodeJS.Timeout = null
    let canRun = true

    async function executeTimer() {
      if (!canRun) return
      const { data: qrcodeStatus } = await window.api.getQRCodeStatus()
      setQRCodeStatusState(qrcodeStatus as QRCodeStatus)
      console.log("qrcodeStatus: ", qrcodeStatus)
      timer = setTimeout(() => {
        if (qrcodeStatus === -2) setImgSrc(refreshImgSrc)
        if (qrcodeStatus === -2 || qrcodeStatus === 1) return
        executeTimer()
      }, 2000)
    }

    executeTimer()

    return () => {
      console.log("canRun = false")
      canRun = false
    }
  }

  async function updateQRCodeBlob() {
    setQRCodeStatusState(-1)
    setIsloading(true)
    try {
      const { data: blob, error, message } = await window.api.getQRCode()
      if (!error) {
        setQRCodBlob(blob)
      } else {
        console.log("updateQRCodeBlob error: ", message)
      }
    } catch (error) {
      console.log("updateQRCodeBlob error", error)
    }
    setIsloading(false)
  }

  return (
    <div className="qr-login">
      <h1 className="qr-login__title">Gama Play | Login</h1>
      <img className="qr-login__img" src={imgSrc} alt="qrcode" />
      {qrcodeStatusState === -2 && (
        <button
          className="qr-login__refresh"
          onClick={updateQRCodeBlob}
          disabled={isLoading}
        >
          點擊刷新條碼
        </button>
      )}
    </div>
  )
}
