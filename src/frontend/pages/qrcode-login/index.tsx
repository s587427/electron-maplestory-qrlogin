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

  const [isLoading, setIsloading] = useState<boolean>(false)
  const [qrcodeImage, setQRCodeImage] = useState<string>(null)
  const [qrcodeStatusState, setQRCodeStatusState] = useState<QRCodeStatus>(-1) // -1 default -2 expired  1 pass
  const refreshImgSrc = "https://tw.newlogin.beanfun.com/images/refresh.png"

  const [imgSrc, setImgSrc] = useState(refreshImgSrc)
  const { signIn } = useAuth()

  useEffect(() => {
    updateQRCodeImage()
  }, [])

  useEffect(() => {
    let clearTimerFn = null
    if (qrcodeImage) {
      // const blob = new Blob([qrcodeImage], { type: "image/png" })
      // const imageUrl = URL.createObjectURL(blob)
      setImgSrc(`data:image/png;base64,${qrcodeImage}`)

      // start check login status
      clearTimerFn = checkQRCodeLoginStatusTimer()
    }
    return () => {
      if (clearTimerFn) {
        clearTimerFn()
      }
    }
  }, [qrcodeImage])

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

  async function updateQRCodeImage() {
    if (isLoading) return
    setQRCodeStatusState(-1)
    setIsloading(true)
    try {
      const { data: base64, error, message } = await window.api.getQRCode()
      if (!error) {
        setQRCodeImage(base64)
      } else {
        console.log("updateQRCodeImage error: ", message)
      }
    } catch (error) {
      console.log("updateQRCodeImage error", error)
    }
    setIsloading(false)
  }

  return (
    <div className="qr-login">
      <h1 className="qr-login__title">Gama Play | Login</h1>
      <img
        className="qr-login__img"
        src={imgSrc}
        alt="qrcode"
        onClick={qrcodeStatusState === -2 ? updateQRCodeImage : () => {}}
      />
      {qrcodeStatusState === -2 && (
        <button
          className="qr-login__refresh"
          // onClick={updateQRCodeImage}
          // disabled={isLoading}
        >
          點擊刷新條碼
        </button>
      )}
    </div>
  )
}
