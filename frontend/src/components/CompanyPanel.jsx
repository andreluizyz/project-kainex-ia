import { useEffect, useState } from "react"
import {
  createCollaborator,
  createSession,
  listCollaborators,
  listCompanyKnowledge,
  listCompanySessions,
  uploadKnowledgeAsCompany,
} from "../services/api"

function CompanyPanel({ token, email }) {
  const [collaborators, setCollaborators] = useState([])
  const [sessions, setSessions] = useState([])
  const [knowledge, setKnowledge] = useState([])

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const [collabForm, setCollabForm] = useState({
    name_collaborator: "",
    email_collaborator: "",
    password: "",
    role: "support",
  })

  const [sessionForm, setSessionForm] = useState({ title: "", collaborator_id: "" })

  const [knowledgeForm, setKnowledgeForm] = useState({
    title: "",
    sourceType: "text",
    contentText: "",
    file: null,
  })

  async function refreshAll() {
    try {
      const [cols, ses, kn] = await Promise.all([
        listCollaborators(token),
        listCompanySessions(token),
        listCompanyKnowledge(token),
      ])
      setCollaborators(cols)
      setSessions(ses)
      setKnowledge(kn)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    refreshAll()
  }, [])

  async function handleCreateCollaborator(event) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setMessage("")
    try {
      await createCollaborator(token, collabForm)
      setCollabForm({ name_collaborator: "", email_collaborator: "", password: "", role: "support" })
      setMessage("Collaborator created")
      await refreshAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleCreateSession(event) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setMessage("")
    try {
      await createSession(token, {
        title: sessionForm.title,
        collaborator_id: sessionForm.collaborator_id ? Number(sessionForm.collaborator_id) : null,
        company_id: 0,
      })
      setSessionForm({ title: "", collaborator_id: "" })
      setMessage("Session created")
      await refreshAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleKnowledgeUpload(event) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setMessage("")
    try {
      await uploadKnowledgeAsCompany(token, knowledgeForm)
      setKnowledgeForm({ title: "", sourceType: "text", contentText: "", file: null })
      setMessage("Knowledge uploaded and chunked")
      await refreshAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
      <div className="grid gap-6">
        <div className="card">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Company</p>
          <h2 className="mt-2 text-2xl font-semibold">Admin workspace</h2>
          <p className="text-sm text-slate-300">Signed as {email}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Collaborators</h3>
            <span className="badge">{collaborators.length}</span>
          </div>

          <form onSubmit={handleCreateCollaborator} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className="input" required placeholder="Name" value={collabForm.name_collaborator} onChange={(e) => setCollabForm((prev) => ({ ...prev, name_collaborator: e.target.value }))} />
            <input className="input" required type="email" placeholder="Email" value={collabForm.email_collaborator} onChange={(e) => setCollabForm((prev) => ({ ...prev, email_collaborator: e.target.value }))} />
            <input className="input" required type="password" placeholder="Password" value={collabForm.password} onChange={(e) => setCollabForm((prev) => ({ ...prev, password: e.target.value }))} />
            <select className="input" value={collabForm.role} onChange={(e) => setCollabForm((prev) => ({ ...prev, role: e.target.value }))}>
              <option value="admin">admin</option>
              <option value="support">support</option>
              <option value="viewer">viewer</option>
            </select>
            <button disabled={busy} className="btn-primary sm:col-span-2" type="submit">Create collaborator</button>
          </form>

          <div className="mt-5 space-y-2">
            {collaborators.map((collab) => (
              <div key={collab.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <p className="font-medium">{collab.name_collaborator}</p>
                <p className="text-xs text-slate-300">{collab.email_collaborator} · {collab.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Knowledge Base</h3>
            <span className="badge">{knowledge.length}</span>
          </div>

          <form onSubmit={handleKnowledgeUpload} className="mt-4 grid gap-3">
            <input className="input" placeholder="Title" value={knowledgeForm.title} onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, title: e.target.value }))} />
            <select className="input" value={knowledgeForm.sourceType} onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, sourceType: e.target.value }))}>
              <option value="text">text</option>
              <option value="pdf">pdf</option>
              <option value="chat">chat</option>
            </select>
            <textarea className="input min-h-28" placeholder="Paste text (optional if file is provided)" value={knowledgeForm.contentText} onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, contentText: e.target.value }))} />
            <input className="input file:mr-3 file:rounded-lg file:border-0 file:bg-violet-400 file:px-3 file:py-2 file:text-violet-950" type="file" onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))} />
            <button disabled={busy} className="btn-primary" type="submit">Upload knowledge</button>
          </form>

          <div className="mt-4 space-y-2">
            {knowledge.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <p className="font-medium">{item.title || "Untitled"}</p>
                <p className="text-xs text-slate-300">{item.source_type} · {new Date(item.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sessions</h3>
            <span className="badge">{sessions.length}</span>
          </div>

          <form onSubmit={handleCreateSession} className="mt-4 grid gap-3">
            <input className="input" required placeholder="Session title" value={sessionForm.title} onChange={(e) => setSessionForm((prev) => ({ ...prev, title: e.target.value }))} />
            <input className="input" type="number" placeholder="Collaborator ID (optional)" value={sessionForm.collaborator_id} onChange={(e) => setSessionForm((prev) => ({ ...prev, collaborator_id: e.target.value }))} />
            <button disabled={busy} className="btn-primary" type="submit">Create session</button>
          </form>

          <div className="mt-4 space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <p className="font-medium">#{session.id} · {session.title || "No title"}</p>
                <p className="text-xs text-slate-300">Updated: {new Date(session.updated_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {(message || error) && (
          <div className={`card ${error ? "border-rose-400/35" : "border-emerald-400/35"}`}>
            <p className={`text-sm ${error ? "text-rose-200" : "text-emerald-200"}`}>{error || message}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CompanyPanel
