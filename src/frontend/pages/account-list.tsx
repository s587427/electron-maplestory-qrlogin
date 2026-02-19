import { ServiceAccount } from "@/backend/services/account"
import { useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/AuthContext"
import "./qrcode-login/index.css"

export function AccountListPage() {
  const navigate = useNavigate()
  const { accountList } = useAuth()
  const [otp, setOtp] = useState<string>("")

  async function getOtp(services: ServiceAccount) {
    window.api.getOtp(services).then((res) => setOtp(res))
  }

  return (
    <div>
      {/* accoun-list <button onClick={() => navigate("/")}>go to index</button> */}
      <h2>account</h2>
      <ul>
        {accountList?.accountList.map((account) => (
          <li key={account.ssn}>
            <div>{account.clickable}</div>
            <div>{account.createTime}</div>
            <div>
              {account.id}
              <button
                onClick={async () =>
                  await navigator.clipboard.writeText(account.id)
                }
              >
                copy
              </button>
            </div>
            <div>{account.name}</div>
            <div>{account.ssn}</div>
            <button onClick={() => getOtp(account)}>otp: {otp}</button>
            <button
              onClick={async () => await navigator.clipboard.writeText(otp)}
            >
              copy
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
