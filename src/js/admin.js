// js/admin.js - Secure authentication-based admin
const REQS = {
  hero:    { w:1920, h:1080, mb:2,   accept:["image/jpeg","image/png","image/webp"] },
  gallery: { w:1600, h:1200, mb:1.5, accept:["image/jpeg","image/png","image/webp"] },
  thumb:   { w:800,  h:600,  mb:0.5, accept:["image/jpeg","image/png","image/webp"] },
  team:    { w:600,  h:600,  mb:1,   accept:["image/jpeg","image/png"] },
  logo:    { w:400,  h:200,  mb:0.2, accept:["image/png","image/svg+xml","image/jpeg"] },
};

const root = document.documentElement;
const csrf = (document.cookie.match(/(?:^|;\s*)session=([^;]+)/)?.[1] || "").slice(0,24);

function setAuthed(on){ 
  root.classList.toggle("authed", !!on); 
  root.classList.toggle("auth-pending", !on); 
}

function canUpload(){ 
  const cat = catEl?.value; 
  const file = fileEl?.files?.[0]; 
  return Boolean(cat && file && preview.dataset.ok === "1"); 
}

function updateBtn(){ 
  if (uploadBtn) uploadBtn.disabled = !canUpload(); 
}

// Featured project validation - updated for local images
function validateFeaturedProject(projectData) {
  if (projectData.featured && (!projectData.media?.heroWide?.url)) {
    return { valid: false, error: "Featured projects require a valid heroWide image (1920×1080)" };
  }
  return { valid: true };
}

const reqsEl = document.getElementById("reqs");
const fileEl = document.getElementById("file");
const catEl = document.getElementById("category");
const projectEl = document.getElementById("projectId");
const preview = document.getElementById("preview");
const uploadBtn = document.getElementById("uploadBtn");

// --- session check
(async function init(){
  try {
    const r = await fetch("/api/session", { credentials:"include" });
    const j = await r.json();
    setAuthed(Boolean(j?.ok));
  } catch {
    setAuthed(false);
  }
})();

// Login form
document.getElementById("loginForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const status = document.getElementById("loginStatus");
  status.textContent = "Signing in…";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/login",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email, password }),
      credentials:"include"
    });
    
    if (res.ok){
      status.textContent = "";
      setAuthed(true);
      window.location.reload();
    } else {
      const j = await res.json().catch(() => ({}));
      status.textContent = j.error === "rate_limited" ? "Too many attempts. Try again later." : "Login failed. Check credentials.";
    }
  } catch (error) {
    status.textContent = "Connection error. Check network.";
    status.style.color = "#DC2626";
  }
});

// Logout button
document.getElementById("logoutBtn")?.addEventListener("click", async ()=>{
  await fetch("/api/logout",{ 
    method:"POST", 
    headers: { "x-csrf-token": csrf },
    credentials:"include" 
  });
  setAuthed(false);
});

// Update requirement text
catEl?.addEventListener("change", ()=>{
  const r = REQS[catEl.value];
  reqsEl.textContent = r ? `Required: ${r.w}×${r.h}px, ≤ ${r.mb} MB, types: ${r.accept.map(t=>t.split('/')[1]).join(', ')}` : "";
  preview.dataset.ok = "";
  updateBtn();
});

// Initialize upload button state
updateBtn();

// Preview + dimension check
fileEl?.addEventListener("change", ()=>{
  preview.innerHTML = "";
  const file = fileEl.files?.[0]; if (!file) return;
  const img = new Image(); img.onload = ()=>{
    const c = REQS[catEl.value];
    if (!c) return;
    const okType = c.accept.includes(file.type);
    const okSize = file.size <= c.mb * 1024 * 1024;
    const okDim  = img.width===c.w && img.height===c.h;
    const isValid = okType && okSize && okDim;
    preview.dataset.ok = isValid ? "1" : "0";
    let msg = `Selected: ${img.width}×${img.height}px · ${(file.size/1024/1024).toFixed(2)}MB · ${file.type}`;
    if (!isValid) msg += " — ❌ does not match requirements.";
    preview.innerHTML = `<img src="${URL.createObjectURL(file)}" style="max-width:320px;border-radius:12px" alt="preview"/><p class="hero-sub">${msg}</p>`;
    updateBtn();
  };
  img.src = URL.createObjectURL(file);
});

// Local Image Upload - Note: Requires local upload API implementation
document.getElementById("uploadForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const status = document.getElementById("uploadStatus");
  const cat = catEl.value; 
  const file = fileEl.files?.[0];
  
  if (!cat || !file){ 
    status.textContent="Choose a category and file."; 
    return; 
  }
  
  // For local-only system, show instructions for manual upload
  status.textContent = "Local Image Upload Instructions:";
  status.style.color = "#0F8B8D";
  
  const category = cat.toLowerCase();
  const projectId = projectEl.value || "default";
  const fileName = file.name.toLowerCase().replace(/\s+/g, '-');
  
  const suggestedPath = `/assets/images/${category}/${projectId}/${fileName}`;
  
  preview.innerHTML = `
    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 class="font-semibold text-blue-900 mb-2">Manual Upload Required</h4>
      <p class="text-blue-800 mb-3">Since we're using local images, please manually place your image at:</p>
      <code class="block p-2 bg-blue-100 text-blue-900 rounded text-sm">${suggestedPath}</code>
      <div class="mt-3 text-sm text-blue-700">
        <p><strong>Steps:</strong></p>
        <ol class="list-decimal list-inside space-y-1">
          <li>Copy your image file to: <code>public${suggestedPath}</code></li>
          <li>Restart the development server if needed</li>
          <li>The image will be available at: <code>${suggestedPath}</code></li>
        </ol>
      </div>
    </div>
  `;
  
  console.log(`📁 Suggested local path: public${suggestedPath}`);
  console.log(`🖼️ File details:`, {
    name: file.name,
    size: `${(file.size / 1024).toFixed(1)}KB`,
    type: file.type,
    category: category,
    projectId: projectId
  });
  
  /* 
  // TODO: Implement local upload API if needed
  // This would require a server-side endpoint to save files to public/assets/images/
  try {
    const fd = new FormData();
    fd.append("category", cat);
    fd.append("projectId", projectEl.value || "");
    fd.append("file", file);
    
    const res = await fetch("/api/upload-local", { 
      method:"POST", 
      headers:{ "x-csrf-token": csrf },
      body: fd, 
      credentials:"include" 
    });
    
    const j = await res.json().catch(()=>null);
    if (res.ok && j?.url){
      status.textContent = `Uploaded ✓ → ${j.url}`;
      status.style.color = "#0F8B8D";
    } else {
      status.textContent = `Failed: ${j?.error || res.statusText}`;
      status.style.color = "#DC2626";
    }
  } catch (err) {
    console.error("Upload error:", err);
    status.textContent = "Upload failed - check connection";
    status.style.color = "#DC2626";
  }
  */
});