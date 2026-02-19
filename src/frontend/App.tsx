import { Route, Routes } from "react-router"
import "./App.css"
import { AccountListPage } from "./pages/account-list"
import { QRCodeLoingPage } from "./pages/qrcode-login"
export default function App() {
  return (
    <div className="layout">
      <Routes>
        <Route path="/" element={<QRCodeLoingPage />} />
        <Route path="/account-list" element={<AccountListPage />} />
      </Routes>
    </div>
  )
}
