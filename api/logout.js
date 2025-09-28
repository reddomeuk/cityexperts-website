// /api/logout.js
import { serialize } from "cookie";
import { assertCsrf } from "./_csrf.js";

export default function handler(req, res){
  if (req.method !== "POST") return res.status(405).end();
  if (!assertCsrf(req, res)) return;
  const isProd = process.env.NODE_ENV === "production";
  const cookie = serialize("session","", {
    httpOnly:true, sameSite:"lax", secure:isProd, path:"/", maxAge:0
  });
  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ ok:true });
}