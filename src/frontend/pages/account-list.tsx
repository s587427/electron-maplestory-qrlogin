import { useNavigate } from "react-router"
import "./qrcode-login/index.css"

export function AccountListPage() {
  const navigate = useNavigate()
  return (
    <div>
      accoun-list <button onClick={() => navigate("/")}>go to index</button>
    </div>
  )
}
