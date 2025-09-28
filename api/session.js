// /api/session.js
export default function handler(req, res){
  const cookieHeader = req.headers.cookie || "";
  const has = /(?:^|;\s*)session=/.test(cookieHeader);
  res.status(200).json({ ok: has });
}