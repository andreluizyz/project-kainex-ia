import { useEffect, useState } from "react"
import {
  listCollaboratorKnowledge,
  listCollaboratorMessages,
  listCollaboratorSessions,
  sendCollaboratorMessage,
  uploadKnowledgeAsCollaborator,
} from "../services/api"

function CollaboratorPanel({ token, email }) {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState("")
  const [messages, setMessages] = useState([])
  const [knowledge, setKnowledge] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [busy, setBusy] = useState(false)
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

    setBusy(true)
    setError("")
    try {
      await sendCollaboratorMessage(token, activeSessionId, chatInput)
      setChatInput("")
      const refreshed = await listCollaboratorMessages(token, activeSessionId)
      setMessages(refreshed)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleUploadKnowledge(event) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      await uploadKnowledgeAsCollaborator(token, knowledgeForm)
      setKnowledgeForm({ title: "", sourceType: "text", contentText: "", file: null })
      await loadBaseData()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-6">
        <div className="card">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Collaborator</p>
          <h2 className="mt-2 text-2xl font-semibold">Training workspace</h2>
          <p className="text-sm text-slate-300">Signed as {email}</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold">Sessions</h3>
          <p className="mt-1 text-xs text-slate-400">Pick one session and continue the conversation.</p>

          <div className="mt-4 space-y-2">
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
                <p className="font-medium">#{session.id} · {session.title || "Untitled"}</p>
                <p className="text-xs text-slate-300">Updated {new Date(session.updated_at).toLocaleString()}</p>
              </button>
            ))}
            {!sessions.length && (
              <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                No sessions available. Ask company admin to create one.
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Knowledge uploads</h3>
            <span className="badge">{knowledge.length}</span>
          </div>

          <form onSubmit={handleUploadKnowledge} className="mt-4 grid gap-3">
            <input className="input" placeholder="Title" value={knowledgeForm.title} onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, title: e.target.value }))} />
            <select className="input" value={knowledgeForm.sourceType} onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, sourceType: e.target.value }))}>
              <option value="text">text</option>
              <option value="pdf">pdf</option>
              <option value="chat">chat</option>
            </select>
            <textarea className="input min-h-24" placeholder="Context text for AI training" value={knowledgeForm.contentText} onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, contentText: e.target.value }))} />
            <input className="input file:mr-3 file:rounded-lg file:border-0 file:bg-violet-400 file:px-3 file:py-2 file:text-violet-950" type="file" onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))} />
            <button disabled={busy} className="btn-primary" type="submit">Upload</button>
          </form>
        </div>
      </div>

      <div className="card min-h-[70vh] flex flex-col">
        <h3 className="text-lg font-semibold">AI Conversation</h3>
        <p className="mt-1 text-xs text-slate-400">Session #{activeSessionId || "-"}</p>

        <div className="mt-4 flex-1 space-y-3 overflow-auto rounded-2xl border border-white/10 bg-slate-900/55 p-4">
          {messages.map((msg) => {
            const fromUser = String(msg.role || "").toLowerCase().includes("collaborator")
            return (
              <div key={msg.id} className={`flex ${fromUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${fromUser ? "bg-violet-500 text-violet-950" : "bg-white/10 text-slate-100"}`}>
                  <p>{msg.message}</p>
                  <p className={`mt-1 text-[11px] ${fromUser ? "text-slate-900/70" : "text-slate-300"}`}>
                    {msg.role} · {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )
          })}
          {!messages.length && <p className="text-sm text-slate-400">No messages yet in this session.</p>}
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 flex gap-3">
          <input
            className="input flex-1"
            placeholder={activeSessionId ? "Write your message..." : "Select a session first"}
            value={chatInput}
            disabled={!activeSessionId}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button disabled={busy || !activeSessionId} className="btn-primary px-5" type="submit">
            Send
          </button>
        </form>

        {error && <p className="mt-3 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
      </div>
    </section>
  )
}

export default CollaboratorPanel
