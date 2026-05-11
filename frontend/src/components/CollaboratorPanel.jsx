import { useEffect, useState } from "react"
import {
  listCollaboratorKnowledge,
  listCollaboratorMessages,
  listCollaboratorSessions,
  sendCollaboratorMessage,
  uploadKnowledgeAsCollaborator,
} from "../services/api"
import { t } from "../i18n"

function CollaboratorPanel({ token, email, locale, theme }) {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState("")
  const [messages, setMessages] = useState([])
  const [knowledge, setKnowledge] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isUploadingKnowledge, setIsUploadingKnowledge] = useState(false)
  const [error, setError] = useState("")

  const [knowledgeForm, setKnowledgeForm] = useState({
    title: "",
    sourceType: "text",
    contentText: "",
    file: null,
  })

  async function loadBaseData() {
    try {
      setError("")
      const [sessionData, knowledgeData] = await Promise.all([
        listCollaboratorSessions(token),
        listCollaboratorKnowledge(token),
      ])

      setSessions(sessionData)
      setKnowledge(knowledgeData)

      if (sessionData.length && !activeSessionId) {
        setActiveSessionId(String(sessionData[0].id))
      }
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadBaseData()
  }, [])

  useEffect(() => {
    async function loadMessages() {
      if (!activeSessionId) return
      try {
        const data = await listCollaboratorMessages(token, activeSessionId)
        setMessages(data)
      } catch (err) {
        setError(err.message)
      }
    }

    loadMessages()
  }, [activeSessionId])

  async function handleSendMessage(event) {
    event.preventDefault()
    if (!chatInput.trim() || !activeSessionId) return

    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      role: "Collaborator",
      message: chatInput.trim(),
      created_at: new Date().toISOString(),
    }

    setIsSendingMessage(true)
    setError("")
    setMessages((prev) => [...prev, optimisticMessage])
    setChatInput("")
    try {
      await sendCollaboratorMessage(token, activeSessionId, chatInput)
      const refreshed = await listCollaboratorMessages(token, activeSessionId)
      setMessages(refreshed)
    } catch (err) {
      setError(err.message)
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
    } finally {
      setIsSendingMessage(false)
    }
  }

  async function handleUploadKnowledge(event) {
    event.preventDefault()
    setIsUploadingKnowledge(true)
    setError("")
    try {
      await uploadKnowledgeAsCollaborator(token, knowledgeForm)
      setKnowledgeForm({ title: "", sourceType: "text", contentText: "", file: null })
      await loadBaseData()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUploadingKnowledge(false)
    }
  }

  return (
    <section className="grid h-full min-h-0 gap-3 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid min-h-0 gap-3">
        <div className="card">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">{t(locale, "collaborator.title")}</p>
          <h2 className="mt-1 text-lg font-semibold">{t(locale, "collaborator.workspace")}</h2>
          <p className="text-xs text-slate-300">{t(locale, "collaborator.signedAs")} {email}</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold">{t(locale, "collaborator.sessions")}</h3>
          <p className="mt-1 text-xs text-slate-400">{t(locale, "collaborator.sessionsHint")}</p>

          <div className="mt-2 max-h-36 space-y-2 overflow-auto pr-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(String(session.id))}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  String(session.id) === String(activeSessionId)
                    ? "border-violet-300/45 bg-violet-500/15"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <p className="font-medium">#{session.id} · {session.title || t(locale, "collaborator.untitled")}</p>
                <p className="text-xs text-slate-300">{t(locale, "collaborator.updated")} {new Date(session.updated_at).toLocaleString()}</p>
              </button>
            ))}
            {!sessions.length && (
              <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                {t(locale, "collaborator.noSessions")}
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t(locale, "collaborator.knowledgeUploads")}</h3>
            <span className="badge">{knowledge.length}</span>
          </div>

          <form onSubmit={handleUploadKnowledge} className="mt-2 grid gap-2">
            <input className="input" placeholder={t(locale, "collaborator.titleField")} value={knowledgeForm.title} onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, title: e.target.value }))} />
            <select className="input" value={knowledgeForm.sourceType} onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, sourceType: e.target.value }))}>
              <option value="text">text</option>
              <option value="pdf">pdf</option>
              <option value="chat">chat</option>
            </select>
            <textarea className="input min-h-16" placeholder={t(locale, "collaborator.contextText")} value={knowledgeForm.contentText} onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, contentText: e.target.value }))} />
            <input className="input file:mr-3 file:rounded-lg file:border-0 file:bg-violet-400 file:px-3 file:py-2 file:text-violet-950" type="file" onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))} />
            <button disabled={isUploadingKnowledge} className="btn-primary" type="submit">{t(locale, "collaborator.upload")}</button>
          </form>
        </div>
      </div>

      <div className="card h-full min-h-0 flex flex-col">
        <h3 className="text-lg font-semibold">{t(locale, "collaborator.conversation")}</h3>
        <p className="mt-1 text-xs text-slate-400">{t(locale, "collaborator.session")} #{activeSessionId || "-"}</p>

        <div className="mt-2 flex-1 min-h-0 space-y-3 overflow-auto rounded-2xl border border-white/10 bg-slate-900/55 p-3">
          {messages.map((msg) => {
            const fromUser = String(msg.role || "").toLowerCase().includes("collaborator")
            return (
              <div key={msg.id} className={`flex ${fromUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${fromUser ? "bg-violet-500 text-violet-950" : "bg-white/10 text-slate-100"}`}>
                  <p className="whitespace-pre-wrap leading-6">{msg.message}</p>
                  <p className={`mt-1 text-[11px] ${fromUser ? "text-slate-900/70" : "text-slate-300"}`}>
                    {msg.role} · {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )
          })}
          {!messages.length && <p className="text-sm text-slate-400">{t(locale, "collaborator.noMessages")}</p>}

          {isSendingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[78%] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-violet-300 border-t-transparent" aria-hidden="true" />
                  <span>{t(locale, "collaborator.thinking")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="mt-2 flex gap-2">
          <input
            className="input flex-1"
            placeholder={activeSessionId ? t(locale, "collaborator.writeMessage") : t(locale, "collaborator.selectSessionFirst")}
            value={chatInput}
            disabled={!activeSessionId || isSendingMessage}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button disabled={isSendingMessage || !activeSessionId} className="btn-primary px-5" type="submit">
            <span className="inline-flex items-center gap-2">
              {isSendingMessage && <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
              {isSendingMessage ? t(locale, "collaborator.sending") : t(locale, "collaborator.send")}
            </span>
          </button>
        </form>

        {error && <p className="mt-3 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
      </div>
    </section>
  )
}

export default CollaboratorPanel
