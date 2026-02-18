import { Route, Routes } from "react-router"
import { AccountListPage } from "./frontend/pages/account-list"
import { QRCodeLoingPage } from "./frontend/pages/qrcode-login"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<QRCodeLoingPage />} />
      <Route path="/account-list" element={<AccountListPage />} />
    </Routes>
  )
}
