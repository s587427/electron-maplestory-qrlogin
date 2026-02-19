// src/renderer.tsx
import ReactDOM from "react-dom/client"
import { HashRouter } from "react-router"
import App from "./frontend/App"
import { AuthProvider } from "./frontend/contexts/AuthContext"

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
  <HashRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </HashRouter>
)
