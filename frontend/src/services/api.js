const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options)

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status}`
    try {
      const data = await response.json()
      errorMessage = data.detail || errorMessage
    } catch {
      // keep default message
    }
    throw new Error(errorMessage)
  }

  if (response.status === 204) return null
  return response.json()
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export async function registerCompany(payload) {
  return request("/auth/register/company", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export async function loginCompany(email, password) {
  const form = new URLSearchParams({ username: email, password })
  return request("/auth/token/company", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  })
}

export async function loginCollaborator(email, password) {
  const form = new URLSearchParams({ username: email, password })
  return request("/auth/token/collaborator", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  })
}

export async function listCollaborators(token) {
  return request("/company/collaborators", {
    headers: authHeaders(token),
  })
}

export async function createCollaborator(token, payload) {
  return request("/company/collaborators", {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export async function listCompanySessions(token) {
  return request("/sessions/", {
    headers: authHeaders(token),
  })
}

export async function createSession(token, payload) {
  return request("/sessions/", {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export async function listCollaboratorSessions(token) {
  return request("/sessions/me", {
    headers: authHeaders(token),
  })
}

export async function listCollaboratorMessages(token, sessionId) {
  return request(`/chat/sessions/${sessionId}/messages`, {
    headers: authHeaders(token),
  })
}

export async function sendCollaboratorMessage(token, sessionId, message) {
  return request(`/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: Number(sessionId),
      role: "Collaborator",
      message,
    }),
  })
}

export async function listCompanyKnowledge(token) {
  return request("/knowledge/company", {
    headers: authHeaders(token),
  })
}

export async function listCollaboratorKnowledge(token) {
  return request("/knowledge/collaborator", {
    headers: authHeaders(token),
  })
}

export async function uploadKnowledgeAsCompany(token, payload) {
  const form = new FormData()
  if (payload.title) form.append("title", payload.title)
  if (payload.sourceType) form.append("source_type", payload.sourceType)
  if (payload.contentText) form.append("content_text", payload.contentText)
  if (payload.file) form.append("file", payload.file)

  return request("/knowledge/company/upload", {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  })
}

export async function uploadKnowledgeAsCollaborator(token, payload) {
  const form = new FormData()
  if (payload.title) form.append("title", payload.title)
  if (payload.sourceType) form.append("source_type", payload.sourceType)
  if (payload.contentText) form.append("content_text", payload.contentText)
  if (payload.file) form.append("file", payload.file)

  return request("/knowledge/collaborator/upload", {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  })
}
