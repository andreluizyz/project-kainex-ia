import { useMemo, useState } from "react"
import AuthScreen from "./components/AuthScreen"
import CompanyPanel from "./components/CompanyPanel"
import CollaboratorPanel from "./components/CollaboratorPanel"
import { t } from "./i18n"

const AUTH_KEY = "kainex_auth"
const LOCALE_KEY = "kainex_locale"
const THEME_KEY = "kainex_theme"

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
  const [locale, setLocale] = useState(() => localStorage.getItem(LOCALE_KEY) || "pt-BR")
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark")

  function handleLogin(payload) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload))
    setAuth(payload)
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY)
    setAuth(null)
  }

  function handleLocaleChange(nextLocale) {
    localStorage.setItem(LOCALE_KEY, nextLocale)
    setLocale(nextLocale)
  }

  function handleThemeChange(nextTheme) {
    localStorage.setItem(THEME_KEY, nextTheme)
    setTheme(nextTheme)
  }

  const roleLabel = useMemo(() => {
    if (!auth) return t(locale, "app.guest")
    return auth.role === "company" ? t(locale, "app.company") : t(locale, "app.collaborator")
  }, [auth, locale])

  return (
    <div className={`h-screen overflow-hidden app-shell text-slate-100 theme-${theme}`}>
      <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${theme === "dark" ? "border-white/10 bg-slate-950/70" : "border-slate-300/80 bg-white/85"}`}>
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <p className={`text-xs uppercase tracking-[0.18em] ${theme === "dark" ? "text-violet-300/90" : "text-violet-700"}`}>{t(locale, "app.brand")}</p>
            <h1 className={`text-lg font-semibold ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>{t(locale, "app.title")}</h1>
          </div>

          <div className="flex items-center gap-3">
            <label className={`text-xs ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>{t(locale, "app.language")}</label>
            <select
              className="input !w-auto !py-1.5 !px-2 text-xs"
              value={locale}
              onChange={(e) => handleLocaleChange(e.target.value)}
            >
              <option value="pt-BR">PT-BR</option>
              <option value="en">English</option>
            </select>

            <label className={`text-xs ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>{t(locale, "app.theme")}</label>
            <select
              className="input !w-auto !py-1.5 !px-2 text-xs"
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              <option value="dark">{t(locale, "app.dark")}</option>
              <option value="light">{t(locale, "app.light")}</option>
            </select>

            <span className={`rounded-full border px-3 py-1 text-xs ${theme === "dark" ? "border-white/15 bg-white/5 text-slate-300" : "border-slate-300 bg-slate-100 text-slate-700"}`}>
              {roleLabel}
            </span>
            {auth && (
              <button
                onClick={handleLogout}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${theme === "dark" ? "border-rose-300/40 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20" : "border-rose-300 bg-rose-100 text-rose-700 hover:bg-rose-200"}`}
              >
                {t(locale, "app.logout")}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto h-[calc(100vh-77px)] w-full max-w-7xl overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
        {!auth && <AuthScreen onLogin={handleLogin} locale={locale} theme={theme} />}

        {auth?.role === "company" && (
          <CompanyPanel
            token={auth.accessToken}
            email={auth.email}
            locale={locale}
            theme={theme}
          />
        )}

        {auth?.role === "collaborator" && (
          <CollaboratorPanel
            token={auth.accessToken}
            email={auth.email}
            locale={locale}
            theme={theme}
          />
        )}
      </main>
    </div>
  )
}

export default App