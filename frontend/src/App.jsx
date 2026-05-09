import { useMemo, useState } from "react"
import AuthScreen from "./components/AuthScreen"
import CompanyPanel from "./components/CompanyPanel"
import CollaboratorPanel from "./components/CollaboratorPanel"

const AUTH_KEY = "kainex_auth"

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function App() {
  const [auth, setAuth] = useState(() => readStoredAuth())

  function handleLogin(payload) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload))
    setAuth(payload)
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY)
    setAuth(null)
  }

  const roleLabel = useMemo(() => {
    if (!auth) return "Guest"
    return auth.role === "company" ? "Company" : "Collaborator"
  }, [auth])

  return (
    <div className="min-h-screen app-shell text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-xl bg-slate-950/70">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-300/90">Kainex IA</p>
            <h1 className="text-lg font-semibold">Enterprise AI Console</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {roleLabel}
            </span>
            {auth && (
              <button
                onClick={handleLogout}
                className="rounded-xl border border-rose-300/40 bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-400/20"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!auth && <AuthScreen onLogin={handleLogin} />}

        {auth?.role === "company" && (
          <CompanyPanel
            token={auth.accessToken}
            email={auth.email}
          />
        )}

        {auth?.role === "collaborator" && (
          <CollaboratorPanel
            token={auth.accessToken}
            email={auth.email}
          />
        )}
      </main>
    </div>
  )
}

export default App