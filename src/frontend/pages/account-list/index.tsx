import { ServiceAccount } from "@/backend/services/auth"
import { useAuth } from "@/frontend/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import "./index.css"

const mockGetAccountsResult = {
  accountAmountLimitNotice:
    "單一帳號最多可建立 5 個子帳號，請妥善管理您的帳號數量。",
  accountList: [
    {
      clickable: true,
      id: "acc_1001",
      ssn: "A123456789",
      name: "王小明",
      createTime: "2025-12-01T10:15:30Z",
    },
    {
      clickable: true,
      id: "acc_1002",
      ssn: "B223456789",
      name: "陳小華",
      createTime: "2025-12-05T08:22:10Z",
    },
    {
      clickable: false,
      id: "acc_1003",
      ssn: "C323456789",
      name: "林志遠",
      createTime: "2026-01-02T14:03:55Z",
    },
    {
      clickable: true,
      id: "acc_1004",
      ssn: "D423456789",
      name: "張雅婷",
      createTime: "2026-01-10T19:45:12Z",
    },
    {
      clickable: false,
      id: "acc_1005",
      ssn: "E523456789",
      name: "李承翰",
      createTime: "2026-02-15T07:30:40Z",
    },
  ],
}

export function AccountListPage() {
  const navigate = useNavigate()
  const { accountList, signOut } = useAuth()
  // const accountList = mockGetAccountsResult
  const [otp, setOtp] = useState<string>("")
  const [selectedAccount, setSelectedAccount] = useState<
    ServiceAccount | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!accountList) {
      navigate("/")
    }

    autoSelectAccount()

    async function autoSelectAccount() {
      const preSelectAccountId =
        await window.store.get<string>("preSelectAccountId")
      const account = accountList?.accountList.find(
        (account) => account.id === preSelectAccountId
      )
      if (account && accountList?.accountList.length > 0) {
        account
          ? handleClickAccount(account)
          : handleClickAccount(accountList?.accountList[0])
      }
    }
  }, [accountList])

  async function handleClickFetchOtp() {
    if (selectedAccount) {
      setIsLoading(true)
      try {
        const { error, message, data } =
          await window.api.getOtp(selectedAccount)

        if (!error) {
          setOtp(data)
          navigator.clipboard.writeText(data)
        } else {
          console.log("getOtpError: ", message)
          navigate("/")
        }
      } catch (error) {
        console.log("fetchOtpError: ", error)
        navigate("/")
      }

      setIsLoading(false)
    }
  }

  function handleClickAccount(account: ServiceAccount) {
    setSelectedAccount(account)
    window.store.set("preSelectAccountId", account.id)
    navigator.clipboard.writeText(account.id)
  }

  return (
    <div className="account">
      <button className="account__signout" onClick={signOut}>
        登出
      </button>
      <ul className="account__list">
        {accountList?.accountList.map((account) => (
          <li key={account.id}>
            <span
              className={selectedAccount?.id === account.id ? "selected" : ""}
              onClick={() => handleClickAccount(account)}
            >
              {account.id}
            </span>
          </li>
        ))}
      </ul>

      <div
        className="account__password-detail"
        onClick={() => {
          navigator.clipboard.writeText(otp)
        }}
      >
        {otp}
      </div>

      <button
        className="account__password-btn"
        disabled={isLoading}
        onClick={handleClickFetchOtp}
      >
        獲取密碼
      </button>
    </div>
  )
}
