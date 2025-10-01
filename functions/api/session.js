// /api/session.js
export default function handler(req, res){
  const cookieHeader = req.headers.cookie || "";
  
  // Extract session cookie value
  const sessionMatch = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
  if (!sessionMatch) {
    return res.status(200).json({ ok: false });
  }
  
  const sessionValue = sessionMatch[1];
  
  try {
    // Decode and validate session
    const sessionData = JSON.parse(Buffer.from(sessionValue, "base64url").toString("utf8"));
    
    // Check if session is expired (8 hours)
    const maxAge = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    const isExpired = Date.now() - sessionData.iat > maxAge;
    
    if (isExpired) {
      return res.status(200).json({ ok: false, expired: true });
    }
    
    // Session is valid
    return res.status(200).json({ 
      ok: true, 
      user: sessionData.sub,
      iat: sessionData.iat 
    });
    
  } catch (error) {
    // Invalid session format
    return res.status(200).json({ ok: false, error: "invalid_session" });
  }
}