import { useState } from "react"
import { loginCollaborator, loginCompany, registerCompany } from "../services/api"
import logo from "../assets/kainex-ia-image.png"

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("company-login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [registerForm, setRegisterForm] = useState({
    name_company: "",
    email_company: "",
    password: "",
    plan_id: null,
  })

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })

  async function handleRegisterCompany(event) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await registerCompany(registerForm)
      setSuccess("Company created. You can login now.")
      setMode("company-login")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCompanyLogin(event) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = await loginCompany(loginForm.email, loginForm.password)
      onLogin({ role: "company", email: loginForm.email, accessToken: token.access_token })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCollaboratorLogin(event) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = await loginCollaborator(loginForm.email, loginForm.password)
      onLogin({ role: "collaborator", email: loginForm.email, accessToken: token.access_token })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-[1.6rem] border border-violet-300/25 bg-gradient-to-b from-violet-950/65 to-fuchsia-950/40 p-6 shadow-[0_24px_80px_rgba(76,29,149,0.45)] sm:p-8">
      <div className="flex flex-col items-center text-center">
        <img src={logo} alt="Kainex IA" className="h-20 w-auto object-contain" />
        <h2 className="mt-4 text-2xl font-semibold text-white">Sign in</h2>
        <p className="mt-1 text-sm text-violet-200/85">Access your company or collaborator workspace.</p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-2">
        <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
          <button
            onClick={() => setMode("company-login")}
            className={`rounded-xl px-3 py-2 transition ${mode === "company-login" ? "bg-violet-400 text-violet-950" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
          >
            Company
          </button>
          <button
            onClick={() => setMode("company-register")}
            className={`rounded-xl px-3 py-2 transition ${mode === "company-register" ? "bg-violet-400 text-violet-950" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
          >
            Register
          </button>
          <button
            onClick={() => setMode("collaborator-login")}
            className={`rounded-xl px-3 py-2 transition ${mode === "collaborator-login" ? "bg-violet-400 text-violet-950" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
          >
            Collaborator
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
      {success && <p className="mt-4 rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</p>}

      {mode === "company-register" && (
        <form onSubmit={handleRegisterCompany} className="mt-5 grid gap-4">
          <input
            required
            placeholder="Company name"
            value={registerForm.name_company}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, name_company: e.target.value }))}
            className="input"
          />
          <input
            required
            type="email"
            placeholder="Company email"
            value={registerForm.email_company}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, email_company: e.target.value }))}
            className="input"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
            className="input"
          />
          <input
            type="number"
            placeholder="Plan ID (optional)"
            onChange={(e) => {
              const value = e.target.value
              setRegisterForm((prev) => ({ ...prev, plan_id: value ? Number(value) : null }))
            }}
            className="input"
          />
          <button disabled={loading} className="btn-primary" type="submit">
            {loading ? "Creating..." : "Create company"}
          </button>
        </form>
      )}

      {mode === "company-login" && (
        <form onSubmit={handleCompanyLogin} className="mt-5 grid gap-4">
          <input
            required
            type="email"
            placeholder="Company email"
            value={loginForm.email}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
            className="input"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            className="input"
          />
          <button disabled={loading} className="btn-primary" type="submit">
            {loading ? "Signing in..." : "Sign in as company"}
          </button>
        </form>
      )}

      {mode === "collaborator-login" && (
        <form onSubmit={handleCollaboratorLogin} className="mt-5 grid gap-4">
          <input
            required
            type="email"
            placeholder="Collaborator email"
            value={loginForm.email}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
            className="input"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            className="input"
          />
          <button disabled={loading} className="btn-primary" type="submit">
            {loading ? "Signing in..." : "Sign in as collaborator"}
          </button>
        </form>
      )}
    </section>
  )
}

export default AuthScreen
