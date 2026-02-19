import { GetAccountsResult } from "@/backend/services/account"
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react"

type AuthContextType = {
  accountList: GetAccountsResult
  setAccountList: Dispatch<SetStateAction<GetAccountsResult>>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accountList, setAccountList] = useState<GetAccountsResult>(null)

  const value = {
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
