const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
let sessionId;

export function getSessionId() {
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : `anon-${Date.now()}`;
  }
  return sessionId;
}

export function trackEvent(event, metadata = {}) {
  if (!API_BASE && import.meta.env.DEV) return;
  fetch(`${API_BASE}/api/analytics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      page: window.location.pathname,
      session_id: getSessionId(),
      metadata
    })
  }).catch(() => {});
}
