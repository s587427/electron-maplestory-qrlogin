import { useNavigate } from "react-router"

export function AccountListPage() {
  const navigate = useNavigate()
  return (
    <div>
      accoun-list <button onClick={() => navigate("/")}>go to index</button>
    </div>
  )
}
