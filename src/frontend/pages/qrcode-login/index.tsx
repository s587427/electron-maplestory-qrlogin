import { useAuth } from "@/frontend/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

export function QRCodeLoingPage() {
  const navigate = useNavigate()

  const [imgSrc, setImgSrc] = useState(
    "https://tw.newlogin.beanfun.com/images/refresh.png"
  )
  const [qrcodeStatusState, setQRCodeStatusState] = useState<Number>(-1)
  const { setAccountList } = useAuth()

  useEffect(() => {
    let checkQRCodeTimer: NodeJS.Timeout

    window.api
      .getQRCode()
      .then((response) => {
        // console.log(buffer)

        const blob = new Blob([response.data], { type: "image/png" })
        const imageUrl = URL.createObjectURL(blob)
        setImgSrc(imageUrl)

        // start check login status
        checkQRCodeTimer = checkQRCodeLoginStatusTimer()
      })
      .catch((err) => console.log(err))

    return () => {
      clearTimeout(checkQRCodeTimer)
    }
  }, [])

  useEffect(() => {
    if (qrcodeStatusState === 1) {
      qrcodeLogin()
    }
  }, [qrcodeStatusState])

  function checkQRCodeLoginStatusTimer() {
    let timer: null | NodeJS.Timeout = null
    async function executeTimer() {
      const { data: qrcodeStatus } = await window.api.getQRCodeStatus()
      setQRCodeStatusState(qrcodeStatus)
      console.log("qrcodeStatus: ", qrcodeStatus)
      timer = setTimeout(() => {
        if (qrcodeStatus === -2 || qrcodeStatus === 1) return
        executeTimer()
      }, 2000)
    }

    executeTimer()

    return timer
  }

  async function qrcodeLogin() {
    const { error, data, message } = await window.api.postQRCodeLogin()
    console.log("proccessLogin message: ", message, data)
    if (data) {
      setAccountList(data)
      navigate("/account-list")
    }
  }

  return (
    <div className="qr-login">
      <h1 className="qr-login__title">Gama Play | Login</h1>
      <img className="qr-login__img" src={imgSrc} alt="qrcode" />
      <button className="qr-login__refresh" onClick={() => alert(123)}>
        點擊刷新條碼
      </button>
    </div>
  )
}
