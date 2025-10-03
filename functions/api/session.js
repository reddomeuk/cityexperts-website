// functions/api/session.js - Cloudflare Pages format
export async function onRequestGet({ request, env }) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    
    // Extract session cookie value
    const sessionMatch = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
    if (!sessionMatch) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const sessionValue = sessionMatch[1];
    
    try {
      // Decode and validate session
      const sessionData = JSON.parse(atob(sessionValue));
      
      // Check if session is expired (8 hours)
      const maxAge = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
      const isExpired = Date.now() - sessionData.iat > maxAge;
      
      if (isExpired) {
        return new Response(JSON.stringify({ ok: false, expired: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Session is valid
      return new Response(JSON.stringify({ 
        ok: true, 
        user: sessionData.sub,
        iat: sessionData.iat 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
      
    } catch (parseError) {
      console.error('[ERROR] Session parse error:', parseError);
      return new Response(JSON.stringify({ ok: false, error: "invalid_session" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    
  } catch (err) {
    console.error('[ERROR] Session check failed:', err);
    return new Response(JSON.stringify({ ok: false, error: "session_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}