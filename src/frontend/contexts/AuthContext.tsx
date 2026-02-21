import { GetAccountsResult } from "@/backend/services/auth"
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react"
import { useNavigate } from "react-router"

type AuthContextType = {
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  accountList: GetAccountsResult
  setAccountList: Dispatch<SetStateAction<GetAccountsResult>>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  const [accountList, setAccountList] = useState<GetAccountsResult | null>(null)

  async function signIn() {
    const { error, data, message } = await window.api.postQRCodeLogin()
    console.log("proccessLogin message: ", message, data)
    if (data) {
      setAccountList(data)
      navigate("/account-list")
    }
  }

  async function signOut() {
    const { data: isSignOut, message } = await window.api.signOut()
    console.log(message)
    if (isSignOut) {
      setAccountList(null)
      navigate("/")
    }
  }

  const value = {
    signIn,
    signOut,
    accountList,
    setAccountList,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
