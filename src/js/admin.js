// admin.js - Fixed and working admin panel

let allProjects = [];
let isAuthenticated = false;

const VALID_CREDENTIALS = [
  { email: "admin@cityexperts.ae", password: "TestPassword123" },
  { email: "admin@localhost", password: "admin123" }
];

document.addEventListener('DOMContentLoaded', function() {
  initializeAdmin();
});

function initializeAdmin() {
  console.log('Initializing admin panel...');
  checkAuthentication();
  setupEventListeners();
}

function checkAuthentication() {
  const auth = localStorage.getItem('cityexpert_local_auth');
  const userEmail = localStorage.getItem('cityexpert_user_email');
  
  if (auth === 'authenticated' && userEmail) {
    setAuthenticated(true);
  } else {
    setAuthenticated(false);
  }
}

function setAuthenticated(isAuth) {
  isAuthenticated = isAuth;
  document.documentElement.classList.toggle('authed', isAuth);
  document.documentElement.classList.toggle('auth-pending', !isAuth);
  
  if (isAuth) {
    loadProjects();
  }
}

function setupEventListeners() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  const projSearch = document.getElementById('projSearch');
  if (projSearch) {
    projSearch.addEventListener('input', renderProjectsList);
  }
  
  const projFilterStatus = document.getElementById('projFilterStatus');
  if (projFilterStatus) {
    projFilterStatus.addEventListener('change', renderProjectsList);
  }
  
  const newProjectBtn = document.getElementById('newProjectBtn');
  if (newProjectBtn) {
    newProjectBtn.addEventListener('click', showNewProjectModal);
  }
  
  const projClose = document.getElementById('projClose');
  if (projClose) {
    projClose.addEventListener('click', hideProjectModal);
  }
  
  const projForm = document.getElementById('projForm');
  if (projForm) {
    projForm.addEventListener('submit', handleSaveProject);
  }
  
  const projDelete = document.getElementById('projDelete');
  if (projDelete) {
    projDelete.addEventListener('click', handleDeleteProject);
  }
  
  // Auto-generate ID from title
  const titleField = document.getElementById('f_title_en');
  const idField = document.getElementById('f_id');
  
  if (titleField && idField) {
    titleField.addEventListener('input', function() {
      if (!idField.dataset.userModified) {
        idField.value = generateProjectId(this.value);
      }
    });
    
    idField.addEventListener('input', function() {
      this.dataset.userModified = 'true';
    });
  }
}

function handleLogin(e) {
  e.preventDefault();
  const status = document.getElementById('loginStatus');
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  if (!email || !password) {
    if (status) {
      status.textContent = 'Please enter both email and password';
      status.style.color = '#DC2626';
    }
    return;
  }
  
  const originalBtnText = submitBtn ? submitBtn.textContent : '';
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking credentials...';
  }
  if (status) {
    status.textContent = 'Authenticating...';
    status.style.color = '#0F8B8D';
  }
  
  setTimeout(() => {
    const isValid = VALID_CREDENTIALS.some(cred => 
      cred.email === email && cred.password === password
    );
    
    if (isValid) {
      localStorage.setItem('cityexpert_local_auth', 'authenticated');
      localStorage.setItem('cityexpert_user_email', email);
      
      if (status) {
        status.textContent = 'Login successful - Loading dashboard...';
        status.style.color = '#059669';
      }
      
      setTimeout(() => {
        setAuthenticated(true);
      }, 1000);
    } else {
      if (status) {
        status.textContent = 'Invalid credentials. Try: admin@cityexperts.ae / TestPassword123';
        status.style.color = '#DC2626';
      }
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  }, 800);
}

function handleLogout() {
  localStorage.removeItem('cityexpert_local_auth');
  localStorage.removeItem('cityexpert_user_email');
  setAuthenticated(false);
  showNotification('Logged out successfully');
}

async function loadProjects() {
  try {
    const savedProjects = localStorage.getItem('cityexperts_projects');
    if (savedProjects) {
      allProjects = JSON.parse(savedProjects);
      renderProjectsList();
      loadFeaturedProjects();
      updateDashboardStats();
      console.log('Loaded', allProjects.length, 'projects from localStorage');
      return;
    }
    
    const response = await fetch('/data/projects.json');
    if (!response.ok) throw new Error('Failed to load projects');
    
    allProjects = await response.json();
    renderProjectsList();
    loadFeaturedProjects();
    updateDashboardStats();
    console.log('Loaded', allProjects.length, 'projects from JSON file');
  } catch (error) {
    console.error('Error loading projects:', error);
    showProjectsError('Failed to load projects');
  }
}

function updateDashboardStats() {
  const stats = {
    total: allProjects.length,
    published: allProjects.filter(p => p.status === 'published').length,
    draft: allProjects.filter(p => p.status === 'draft').length,
    featured: allProjects.filter(p => p.featured).length
  };
  
  const elements = {
    totalCount: document.getElementById('totalCount'),
    publishedCount: document.getElementById('publishedCount'), 
    draftCount: document.getElementById('draftCount'),
    featuredCount: document.getElementById('featuredCount')
  };
  
  Object.keys(elements).forEach(key => {
    const element = elements[key];
    const statKey = key.replace('Count', '');
    if (element && stats[statKey] !== undefined) {
      element.textContent = stats[statKey];
    }
  });
}

function renderProjectsList() {
  const container = document.getElementById('projectsList');
  if (!container) return;
  
  const searchTerm = document.getElementById('projSearch')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('projFilterStatus')?.value || 'published';
  
  let filteredProjects = allProjects;
  
  if (statusFilter && statusFilter !== 'all') {
    filteredProjects = filteredProjects.filter(p => p.status === statusFilter);
  }
  
  if (searchTerm) {
    filteredProjects = filteredProjects.filter(p => 
      (p.i18n?.en?.title?.toLowerCase().includes(searchTerm)) ||
      (p.id.toLowerCase().includes(searchTerm)) ||
      (p.category?.toLowerCase().includes(searchTerm)) ||
      (p.city?.toLowerCase().includes(searchTerm))
    );
  }
  
  if (filteredProjects.length === 0) {
    container.textContent = 'No projects found';
    return;
  }
  
  // Clear and rebuild
  container.innerHTML = '';
  
  filteredProjects.forEach(project => {
    const content = project.i18n?.en || {};
    const heroImage = project.media?.hero || project.media?.gallery?.[0] || project.media?.thumb;
    
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project-item';
    projectDiv.dataset.projectId = project.id;
    
    const img = document.createElement('img');
    img.src = heroImage?.url || '/assets/images/placeholder.jpg';
    img.alt = content.title || project.id;
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'project-info';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'project-title';
    titleDiv.textContent = content.title || project.id;
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'project-meta';
    let metaText = project.category || 'General';
    if (project.city) metaText += ` • ${project.city}`;
    if (project.completion) metaText += ` • ${project.completion}`;
    if (project.featured) metaText += ' ⭐';
    metaDiv.textContent = metaText;
    
    infoDiv.appendChild(titleDiv);
    infoDiv.appendChild(metaDiv);
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = 'display: flex; gap: 8px; align-items: center;';
    
    const featureBtn = document.createElement('button');
    featureBtn.className = 'btn-icon';
    featureBtn.textContent = project.featured ? 'Remove' : 'Feature';
    featureBtn.onclick = () => toggleFeatured(project.id, !project.featured);
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-icon';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editProject(project.id);
    
    const imagesBtn = document.createElement('button');
    imagesBtn.className = 'btn-icon';
    imagesBtn.textContent = 'Images';
    imagesBtn.onclick = () => manageImages(project.id);
    
    buttonsDiv.appendChild(featureBtn);
    buttonsDiv.appendChild(editBtn);
    buttonsDiv.appendChild(imagesBtn);
    
    projectDiv.appendChild(img);
    projectDiv.appendChild(infoDiv);
    projectDiv.appendChild(buttonsDiv);
    
    container.appendChild(projectDiv);
  });
}

function loadFeaturedProjects() {
  const container = document.getElementById('featuredList');
  if (!container) return;
  
  const featuredProjects = allProjects.filter(p => p.featured === true);
  
  if (featuredProjects.length === 0) {
    container.textContent = 'No featured projects yet. Click "Feature" on any project to add it to the homepage.';
    return;
  }
  
  container.innerHTML = '';
  
  featuredProjects.forEach(project => {
    const content = project.i18n?.en || {};
    const projectDiv = document.createElement('div');
    projectDiv.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px;';
    
    const img = document.createElement('img');
    img.style.cssText = 'width: 60px; height: 40px; object-fit: cover; border-radius: 4px;';
    img.src = project.media?.thumb?.url || '/assets/images/placeholder.jpg';
    img.alt = content.title || project.id;
    
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'flex: 1;';
    infoDiv.innerHTML = `<strong>${content.title || project.id}</strong><br><small>${project.category || 'General'}</small>`;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-icon';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => toggleFeatured(project.id, false);
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-icon';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editProject(project.id);
    
    projectDiv.appendChild(img);
    projectDiv.appendChild(infoDiv);
    projectDiv.appendChild(removeBtn);
    projectDiv.appendChild(editBtn);
    
    container.appendChild(projectDiv);
  });
}

function showProjectsError(message) {
  const container = document.getElementById('projectsList');
  if (container) {
    container.textContent = message;
    container.style.cssText = 'text-align:center;padding:40px;color:#dc2626';
  }
}

function toggleFeatured(projectId, shouldFeature) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;
  
  project.featured = shouldFeature;
  
  saveProjectsData();
  
  showNotification(`${project.i18n?.en?.title || projectId} ${shouldFeature ? 'added to' : 'removed from'} featured projects`);
  
  renderProjectsList();
  loadFeaturedProjects();
  updateDashboardStats();
  
  console.log(`Featured status updated for ${projectId}:`, shouldFeature);
}

function saveProjectsData() {
  try {
    localStorage.setItem('cityexperts_projects', JSON.stringify(allProjects));
    console.log('Projects data saved successfully');
  } catch (error) {
    console.error('Error saving projects data:', error);
    showNotification('Error saving changes', 'error');
  }
}

function editProject(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;
  
  populateProjectForm(project);
  showProjectModal('Edit Project');
}

function manageImages(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;
  
  // Create a simple image management interface
  const imageModal = document.createElement('div');
  imageModal.className = 'modal-backdrop';
  imageModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  const imagePanel = document.createElement('div');
  imagePanel.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    margin: 20px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  `;
  
  // Create header
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;';
  
  const title = document.createElement('h3');
  title.style.cssText = 'margin: 0; font-size: 20px; font-weight: 700; color: #1f2937;';
  title.textContent = `Manage Images: ${project.i18n?.en?.title || project.id}`;
  
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'background: none; border: none; font-size: 28px; cursor: pointer; color: #6b7280; padding: 4px;';
  closeBtn.textContent = '×';
  closeBtn.onclick = () => imageModal.remove();
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Create upload section
  const uploadSection = document.createElement('div');
  uploadSection.style.cssText = 'background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;';
  
  const uploadContent = document.createElement('div');
  uploadContent.innerHTML = `
    <div style="margin-bottom: 16px;">
      <div style="width: 48px; height: 48px; margin: 0 auto 12px; background: #64748b; border-radius: 50%;"></div>
      <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Upload New Images</h4>
      <p style="margin: 0; color: #64748b; font-size: 14px;">Drag and drop images here, or click to select files</p>
    </div>
  `;
  
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  fileInput.id = `imageUpload-${projectId}`;
  
  const chooseBtn = document.createElement('button');
  chooseBtn.style.cssText = 'background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; margin-right: 12px;';
  chooseBtn.textContent = 'Choose Files';
  chooseBtn.onclick = () => fileInput.click();
  
  const generateBtn = document.createElement('button');
  generateBtn.style.cssText = 'background: #059669; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;';
  generateBtn.textContent = 'Generate Sample Images';
  generateBtn.onclick = () => simulateImageGeneration(projectId);
  
  uploadContent.appendChild(fileInput);
  uploadContent.appendChild(chooseBtn);
  uploadContent.appendChild(generateBtn);
  uploadSection.appendChild(uploadContent);
  
  // File upload handler
  fileInput.addEventListener('change', (e) => handleImageUpload(e, projectId));
  
  // Gallery section
  const gallerySection = document.createElement('div');
  const galleryTitle = document.createElement('h4');
  galleryTitle.style.cssText = 'margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #374151;';
  galleryTitle.textContent = `Image Gallery (${project.media?.gallery?.length || 0} images)`;
  
  const galleryGrid = document.createElement('div');
  galleryGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;';
  galleryGrid.id = `imageGallery-${projectId}`;
  
  gallerySection.appendChild(galleryTitle);
  gallerySection.appendChild(galleryGrid);
  
  refreshImageGallery(projectId);
  
  // Assemble modal
  imagePanel.appendChild(header);
  imagePanel.appendChild(uploadSection);
  imagePanel.appendChild(gallerySection);
  imageModal.appendChild(imagePanel);
  document.body.appendChild(imageModal);
  
  // Close on backdrop click
  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
      imageModal.remove();
    }
  });
}

function handleImageUpload(event, projectId) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  
  processImageFiles(files, projectId);
}

function processImageFiles(files, projectId) {
  showNotification(`Processing ${files.length} image(s)...`, 'info');
  
  let processedCount = 0;
  const imagePromises = files.map((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          url: e.target.result,
          alt: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' '),
          filename: file.name,
          size: file.size,
          uploadDate: new Date().toISOString()
        };
        
        processedCount++;
        resolve(imageData);
      };
      reader.readAsDataURL(file);
    });
  });
  
  Promise.all(imagePromises).then(images => {
    addImagesToProject(projectId, images);
    refreshImageGallery(projectId);
    showNotification(`Successfully uploaded ${images.length} image(s)!`, 'success');
  }).catch(error => {
    console.error('Error processing images:', error);
    showNotification('Error processing images. Please try again.', 'error');
  });
}

function addImagesToProject(projectId, images) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;
  
  if (!project.media) {
    project.media = { gallery: [] };
  }
  if (!project.media.gallery) {
    project.media.gallery = [];
  }
  
  project.media.gallery = [...project.media.gallery, ...images];
  
  if (!project.media.hero && images.length > 0) {
    project.media.hero = { ...images[0] };
  }
  if (!project.media.thumb && images.length > 0) {
    project.media.thumb = { ...images[0] };
  }
  
  saveProjectsData();
}

function refreshImageGallery(projectId) {
  const gallery = document.getElementById(`imageGallery-${projectId}`);
  const project = allProjects.find(p => p.id === projectId);
  
  if (!gallery || !project) return;
  
  const currentImages = project.media?.gallery || [];
  gallery.innerHTML = '';
  
  if (currentImages.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.style.cssText = 'color: #9ca3af; text-align: center; padding: 40px; grid-column: 1 / -1;';
    emptyMsg.textContent = 'No gallery images yet. Upload some images to get started!';
    gallery.appendChild(emptyMsg);
    return;
  }
  
  currentImages.forEach((img, index) => {
    const imgCard = document.createElement('div');
    imgCard.style.cssText = 'border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; position: relative; background: white;';
    
    const imgEl = document.createElement('img');
    imgEl.src = img.url;
    imgEl.alt = img.alt || `Image ${index + 1}`;
    imgEl.style.cssText = 'width: 100%; height: 120px; object-fit: cover;';
    
    const imgInfo = document.createElement('div');
    imgInfo.style.cssText = 'padding: 8px;';
    
    const imgLabel = document.createElement('p');
    imgLabel.style.cssText = 'margin: 0; font-size: 12px; color: #6b7280; text-align: center;';
    imgLabel.textContent = img.alt || `Image ${index + 1}`;
    
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display: flex; gap: 4px; justify-content: center; margin-top: 8px;';
    
    const heroBtn = document.createElement('button');
    heroBtn.style.cssText = 'background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;';
    heroBtn.textContent = 'Hero';
    heroBtn.onclick = () => setAsHero(projectId, index);
    
    const thumbBtn = document.createElement('button');
    thumbBtn.style.cssText = 'background: #059669; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;';
    thumbBtn.textContent = 'Thumb';
    thumbBtn.onclick = () => setAsThumb(projectId, index);
    
    const removeBtn = document.createElement('button');
    removeBtn.style.cssText = 'background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => removeGalleryImage(projectId, index);
    
    btnGroup.appendChild(heroBtn);
    btnGroup.appendChild(thumbBtn);
    btnGroup.appendChild(removeBtn);
    
    imgInfo.appendChild(imgLabel);
    imgInfo.appendChild(btnGroup);
    
    imgCard.appendChild(imgEl);
    imgCard.appendChild(imgInfo);
    gallery.appendChild(imgCard);
  });
}

function setAsHero(projectId, imageIndex) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project || !project.media?.gallery?.[imageIndex]) return;
  
  project.media.hero = { ...project.media.gallery[imageIndex] };
  saveProjectsData();
  
  document.querySelector('.modal-backdrop')?.remove();
  manageImages(projectId);
  
  showNotification('Hero image updated successfully!', 'success');
}

function setAsThumb(projectId, imageIndex) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project || !project.media?.gallery?.[imageIndex]) return;
  
  project.media.thumb = { ...project.media.gallery[imageIndex] };
  saveProjectsData();
  
  document.querySelector('.modal-backdrop')?.remove();
  manageImages(projectId);
  
  showNotification('Thumbnail image updated successfully!', 'success');
}

function removeGalleryImage(projectId, imageIndex) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project || !project.media?.gallery?.[imageIndex]) return;
  
  project.media.gallery.splice(imageIndex, 1);
  saveProjectsData();
  
  refreshImageGallery(projectId);
  showNotification('Image removed from gallery!', 'success');
}

function simulateImageGeneration(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;
  
  showNotification('Generating sample images...', 'info');
  
  const sampleImages = [
    {
      url: `data:image/svg+xml;base64,${btoa(`
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1e40af"/>
          <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="24" font-family="Arial">
            ${project.i18n?.en?.title || 'Project'} - Hero
          </text>
          <text x="50%" y="55%" text-anchor="middle" fill="#bfdbfe" font-size="16" font-family="Arial">
            Hero Image Placeholder
          </text>
        </svg>
      `)}`,
      alt: `${project.i18n?.en?.title || 'Project'} Hero Image`,
      filename: 'hero-sample.svg',
      size: 1024,
      uploadDate: new Date().toISOString()
    },
    {
      url: `data:image/svg+xml;base64,${btoa(`
        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#059669"/>
          <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="20" font-family="Arial">
            ${project.i18n?.en?.title || 'Project'}
          </text>
          <text x="50%" y="55%" text-anchor="middle" fill="#a7f3d0" font-size="14" font-family="Arial">
            Gallery Image 1
          </text>
        </svg>
      `)}`,
      alt: `${project.i18n?.en?.title || 'Project'} Gallery Image 1`,
      filename: 'gallery-1-sample.svg',
      size: 800,
      uploadDate: new Date().toISOString()
    },
    {
      url: `data:image/svg+xml;base64,${btoa(`
        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#7c3aed"/>
          <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="20" font-family="Arial">
            ${project.i18n?.en?.title || 'Project'}
          </text>
          <text x="50%" y="55%" text-anchor="middle" fill="#ddd6fe" font-size="14" font-family="Arial">
            Gallery Image 2
          </text>
        </svg>
      `)}`,
      alt: `${project.i18n?.en?.title || 'Project'} Gallery Image 2`,
      filename: 'gallery-2-sample.svg',
      size: 750,
      uploadDate: new Date().toISOString()
    }
  ];
  
  setTimeout(() => {
    addImagesToProject(projectId, sampleImages);
    refreshImageGallery(projectId);
    
    document.querySelector('.modal-backdrop')?.remove();
    manageImages(projectId);
    
    showNotification('Sample images generated successfully!', 'success');
  }, 1000);
}

// Modal Management
function showNewProjectModal() {
  clearProjectForm();
  showProjectModal('New Project');
  
  document.getElementById('f_status').value = 'draft';
  document.getElementById('f_order').value = '0';
  document.getElementById('f_featured').checked = false;
}

function showProjectModal(title = 'Edit Project') {
  const modal = document.getElementById('projModal');
  const backdrop = document.getElementById('modal-backdrop');
  const modalTitle = document.getElementById('projModalTitle');
  
  if (modalTitle) modalTitle.textContent = title;
  
  if (modal && backdrop) {
    modal.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    modal.classList.add('flex');
    
    setTimeout(() => {
      backdrop.classList.remove('opacity-0');
      backdrop.classList.add('opacity-100');
    }, 10);
    
    document.body.style.overflow = 'hidden';
  }
}

function hideProjectModal() {
  const modal = document.getElementById('projModal');
  const backdrop = document.getElementById('modal-backdrop');
  
  if (modal && backdrop) {
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    
    setTimeout(() => {
      modal.classList.add('hidden');
      backdrop.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }, 200);
  }
}

function populateProjectForm(project) {
  const content = project.i18n?.en || {};
  
  document.getElementById('f_title_en').value = content.title || '';
  document.getElementById('f_id').value = project.id || '';
  document.getElementById('f_category').value = project.category || '';
  document.getElementById('f_status').value = project.status || 'draft';
  document.getElementById('f_city').value = project.city || '';
  document.getElementById('f_client').value = project.client || '';
  document.getElementById('f_order').value = project.order || 0;
  document.getElementById('f_featured').checked = project.featured || false;
  document.getElementById('f_excerpt_en').value = content.excerpt || '';
  document.getElementById('f_description_en').value = content.description || '';
  
  document.getElementById('f_id').dataset.userModified = 'true';
}

function clearProjectForm() {
  const form = document.getElementById('projForm');
  if (form) {
    form.reset();
    document.getElementById('f_id').dataset.userModified = '';
  }
  
  const status = document.getElementById('projStatus');
  if (status) status.textContent = '';
}

function generateProjectId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function handleSaveProject(e) {
  e.preventDefault();
  
  const status = document.getElementById('projStatus');
  const saveBtn = document.getElementById('projSave');
  const originalBtnText = saveBtn?.textContent || 'Save Project';
  
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }
  if (status) status.textContent = 'Validating project data...';
  
  try {
    const projectData = collectFormData();
    
    if (!validateProjectData(projectData)) {
      if (status) status.textContent = 'Please fix validation errors';
      return;
    }
    
    if (status) status.textContent = 'Saving project...';
    
    const existingIndex = allProjects.findIndex(p => p.id === projectData.id);
    
    if (existingIndex >= 0) {
      const existingProject = allProjects[existingIndex];
      allProjects[existingIndex] = { 
        ...existingProject, 
        ...projectData,
        created: existingProject.created || new Date().toISOString()
      };
      showNotification(`Project "${projectData.i18n.en.title}" updated successfully`, 'success');
    } else {
      const newProject = {
        ...projectData,
        created: new Date().toISOString(),
        media: {
          hero: null,
          thumb: null,
          gallery: []
        }
      };
      allProjects.push(newProject);
      showNotification(`Project "${projectData.i18n.en.title}" created successfully`, 'success');
    }
    
    renderProjectsList();
    loadFeaturedProjects();
    updateDashboardStats();
    hideProjectModal();
    
    if (status) status.textContent = 'Saved successfully!';
    
    saveProjectsData();
    
  } catch (error) {
    console.error('Error saving project:', error);
    if (status) status.textContent = 'Error saving project';
    showNotification('Error saving project: ' + error.message, 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = originalBtnText;
    }
  }
}

function collectFormData() {
  const currentId = document.getElementById('f_id').value.trim();
  const existingProject = allProjects.find(p => p.id === currentId);
  
  return {
    id: currentId,
    category: document.getElementById('f_category').value,
    status: document.getElementById('f_status').value,
    city: document.getElementById('f_city').value.trim(),
    client: document.getElementById('f_client').value.trim(),
    order: parseInt(document.getElementById('f_order').value) || 0,
    featured: document.getElementById('f_featured').checked,
    completion: new Date().getFullYear().toString(),
    updated: new Date().toISOString(),
    i18n: {
      en: {
        title: document.getElementById('f_title_en').value.trim(),
        excerpt: document.getElementById('f_excerpt_en').value.trim(),
        description: document.getElementById('f_description_en').value.trim(),
        details: document.getElementById('f_description_en').value.trim()
      }
    },
    media: existingProject?.media || {
      hero: null,
      thumb: null,
      gallery: []
    }
  };
}

function validateProjectData(data) {
  const errors = [];
  
  if (!data.id) errors.push('Project ID is required');
  if (!data.i18n.en.title) errors.push('Project title is required');
  if (!data.category) errors.push('Category is required');
  if (!data.status) errors.push('Status is required');
  
  if (data.id && !/^[a-z0-9-]+$/.test(data.id)) {
    errors.push('Project ID must contain only lowercase letters, numbers, and hyphens');
  }
  
  const existingProject = allProjects.find(p => p.id === data.id);
  const isEditing = document.getElementById('f_id').dataset.userModified === 'true';
  
  if (existingProject && !isEditing) {
    errors.push('Project ID already exists - please choose a different ID');
  }
  
  if (data.i18n.en.title && data.i18n.en.title.length < 3) {
    errors.push('Project title must be at least 3 characters long');
  }
  
  if (errors.length > 0) {
    showNotification(errors.join('; '), 'error');
    return false;
  }
  
  return true;
}

async function handleDeleteProject() {
  const projectId = document.getElementById('f_id').value.trim();
  if (!projectId) return;
  
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;
  
  const confirmDelete = confirm(`Are you sure you want to delete "${project.i18n?.en?.title || projectId}"?\n\nThis action cannot be undone.`);
  
  if (confirmDelete) {
    const index = allProjects.findIndex(p => p.id === projectId);
    if (index >= 0) {
      allProjects.splice(index, 1);
      
      renderProjectsList();
      loadFeaturedProjects();
      updateDashboardStats();
      hideProjectModal();
      
      showNotification(`Project "${project.i18n?.en?.title || projectId}" deleted successfully`);
      
      saveProjectsData();
    }
  }
}

function showNotification(message, type = 'success') {
  // Remove existing notifications
  document.querySelectorAll('.admin-notification').forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = 'admin-notification';
  
  const colors = {
    success: { bg: '#dcfce7', border: '#16a34a', text: '#166534' },
    error: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' },
    info: { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' },
    warning: { bg: '#fefce8', border: '#ca8a04', text: '#a16207' }
  };
  
  const colorScheme = colors[type] || colors.info;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colorScheme.bg};
    border: 1px solid ${colorScheme.border};
    color: ${colorScheme.text};
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

// Utility functions
function exportProjects() {
  try {
    const dataStr = JSON.stringify(allProjects, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cityexperts-projects-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Projects exported successfully');
  } catch (error) {
    console.error('Export failed:', error);
    showNotification('Failed to export projects', 'error');
  }
}

function resetToOriginal() {
  const confirmReset = confirm('Are you sure you want to reset to the original projects data?\n\nThis will remove all your changes and cannot be undone.');
  
  if (confirmReset) {
    localStorage.removeItem('cityexperts_projects');
    loadProjects();
    showNotification('Projects reset to original data');
  }
}

// Make functions available globally for onclick handlers
window.toggleFeatured = toggleFeatured;
window.editProject = editProject;
window.manageImages = manageImages;
window.showNewProjectModal = showNewProjectModal;
window.hideProjectModal = hideProjectModal;
window.exportProjects = exportProjects;
window.resetToOriginal = resetToOriginal;

console.log('Admin panel loaded successfully!');