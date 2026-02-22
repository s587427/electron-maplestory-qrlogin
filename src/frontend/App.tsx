import { useState } from "react"
import { Route, Routes } from "react-router"
import "./App.css"
import { ToolBar } from "./components/ToolBar"
import { AuthorInfo } from "./pages/author-info"
import { AccountListPage } from "./pages/account-list"
import { QRCodeLoingPage } from "./pages/qrcode-login"
export default function App() {
  const [isShowAuthorInfo, setIsShowAuthorInfo] = useState<boolean>(true)

  return (
    <div className="layout">
      <ToolBar setIsShowAuthorInfo={setIsShowAuthorInfo} />

      <>
        <main style={{ display: isShowAuthorInfo ? "none" : "block" }}>
          <Routes>
            <Route path="/" element={<QRCodeLoingPage />} />
            <Route path="/account-list" element={<AccountListPage />} />
            {/* <Route path="/" element={<AccountListPage />} /> */}
          </Routes>
        </main>
        {isShowAuthorInfo && (
          <AuthorInfo setIsShowAuthorInfo={setIsShowAuthorInfo} />
        )}
      </>
    </div>
  )
}
