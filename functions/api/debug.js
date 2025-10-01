// Test endpoint to debug the environment
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  
  const debug = {
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT || 'unknown',
    cwd: process.cwd(),
    nodeVersion: process.version,
    platform: process.platform,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
    hasCloudinary: !!env.CLOUDINARY_CLOUD_NAME,
    url: request.url
  };
  
  return new Response(JSON.stringify(debug, null, 2), {
    status: 200,
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}