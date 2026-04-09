import { useState } from "react"
import { Route, Routes } from "react-router"
import "./App.css"
import { ToolBar } from "./components/ToolBar"
import { AccountListPage } from "./pages/account-list"
import { AuthorInfoPage } from "./pages/author-info"
import { QRCodeLoingPage } from "./pages/qrcode-login"
export default function App() {
  const [isShowAuthorInfo, setIsShowAuthorInfo] = useState<boolean>(false)
  const isDev = false
  return (
    <div className="layout">
      <ToolBar setIsShowAuthorInfo={setIsShowAuthorInfo} />

      <>
        <main style={{ display: isShowAuthorInfo ? "none" : "block" }}>
          {isDev ? (
            <div>dev..</div>
          ) : (
            <Routes>
              <Route path="/" element={<QRCodeLoingPage />} />
              <Route path="/account-list" element={<AccountListPage />} />
              {/* <Route path="/" element={<AccountListPage />} /> */}
            </Routes>
          )}
        </main>
        {isShowAuthorInfo && (
          <AuthorInfoPage setIsShowAuthorInfo={setIsShowAuthorInfo} />
        )}
      </>
    </div>
  )
}
