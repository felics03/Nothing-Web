// track.js - sends small, anonymous usage events to the backend.
// No personal info is collected, just a random session id (reset each visit)
// plus which page was viewed and when. Used later for Felix's own
// behavior analysis, not shared with anyone.

function getSessionId() {
  let sid = sessionStorage.getItem("mt_session_id");
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 12);
    sessionStorage.setItem("mt_session_id", sid);
  }
  return sid;
}

function trackEvent(eventType, page) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: getSessionId(),
      event_type: eventType,
      page: page,
    }),
  }).catch(() => {
    // fail silently - analytics should never break the user experience
  });
}
