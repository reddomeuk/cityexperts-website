// api/_csrf.js
export function getCsrfToken(req) {
  const session = (req.headers.cookie || "").match(/(?:^|;\s*)session=([^;]+)/)?.[1] || "";
  return session ? session.slice(0, 24) : "";
}

export function assertCsrf(req, res) {
  // Only enforce on state-changing requests
  if (!["POST","PUT","PATCH","DELETE"].includes(req.method)) return true;
  const token = getCsrfToken(req);
  if (!token || req.headers["x-csrf-token"] !== token) {
    res.status(403).json({ error: "csrf" });
    return false;
  }
  return true;
}