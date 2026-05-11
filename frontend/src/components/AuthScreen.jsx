import { useState } from "react"
import { loginCollaborator, loginCompany, registerCompany } from "../services/api"
import logo from "../assets/kainex-ia-image.png"
import { t } from "../i18n"

function AuthScreen({ onLogin, locale, theme }) {
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
      setSuccess(t(locale, "auth.companyCreated"))
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
    <section className={`mx-auto w-full max-w-md rounded-[1.6rem] border p-6 sm:p-8 ${theme === "dark" ? "border-violet-300/25 bg-gradient-to-b from-violet-950/65 to-fuchsia-950/40 shadow-[0_24px_80px_rgba(76,29,149,0.45)]" : "border-slate-300 bg-gradient-to-b from-white to-violet-50 shadow-[0_20px_45px_rgba(15,23,42,0.15)]"}`}>
      <div className="flex flex-col items-center text-center">
        <img src={logo} alt="Kainex IA" className="h-20 w-auto object-contain" />
        <h2 className={`mt-4 text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{t(locale, "auth.signIn")}</h2>
        <p className={`mt-1 text-sm ${theme === "dark" ? "text-violet-200/85" : "text-slate-600"}`}>{t(locale, "auth.subtitle")}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-2">
        <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
          <button
            onClick={() => setMode("company-login")}
            className={`rounded-xl px-3 py-2 transition ${mode === "company-login" ? "bg-violet-400 text-violet-950" : theme === "dark" ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {t(locale, "auth.companyTab")}
          </button>
          <button
            onClick={() => setMode("company-register")}
            className={`rounded-xl px-3 py-2 transition ${mode === "company-register" ? "bg-violet-400 text-violet-950" : theme === "dark" ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {t(locale, "auth.registerTab")}
          </button>
          <button
            onClick={() => setMode("collaborator-login")}
            className={`rounded-xl px-3 py-2 transition ${mode === "collaborator-login" ? "bg-violet-400 text-violet-950" : theme === "dark" ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {t(locale, "auth.collaboratorTab")}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
      {success && <p className="mt-4 rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</p>}

      {mode === "company-register" && (
        <form onSubmit={handleRegisterCompany} className="mt-5 grid gap-4">
          <input
            required
            placeholder={t(locale, "auth.companyName")}
            value={registerForm.name_company}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, name_company: e.target.value }))}
            className="input"
          />
          <input
            required
            type="email"
            placeholder={t(locale, "auth.companyEmail")}
            value={registerForm.email_company}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, email_company: e.target.value }))}
            className="input"
          />
          <input
            required
            type="password"
            placeholder={t(locale, "auth.password")}
            value={registerForm.password}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
            className="input"
          />
          <input
            type="number"
            placeholder={t(locale, "auth.planId")}
            onChange={(e) => {
              const value = e.target.value
              setRegisterForm((prev) => ({ ...prev, plan_id: value ? Number(value) : null }))
            }}
            className="input"
          />
          <button disabled={loading} className="btn-primary" type="submit">
            {loading ? t(locale, "auth.creating") : t(locale, "auth.createCompany")}
          </button>
        </form>
      )}

      {mode === "company-login" && (
        <form onSubmit={handleCompanyLogin} className="mt-5 grid gap-4">
          <input
            required
            type="email"
            placeholder={t(locale, "auth.companyEmail")}
            value={loginForm.email}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
            className="input"
          />
          <input
            required
            type="password"
            placeholder={t(locale, "auth.password")}
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            className="input"
          />
          <button disabled={loading} className="btn-primary" type="submit">
            {loading ? t(locale, "auth.signingIn") : t(locale, "auth.signInCompany")}
          </button>
        </form>
      )}

      {mode === "collaborator-login" && (
        <form onSubmit={handleCollaboratorLogin} className="mt-5 grid gap-4">
          <input
            required
            type="email"
            placeholder={t(locale, "auth.collaboratorEmail")}
            value={loginForm.email}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
            className="input"
          />
          <input
            required
            type="password"
            placeholder={t(locale, "auth.password")}
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            className="input"
          />
          <button disabled={loading} className="btn-primary" type="submit">
            {loading ? t(locale, "auth.signingIn") : t(locale, "auth.signInCollaborator")}
          </button>
        </form>
      )}
    </section>
  )
}

export default AuthScreen
