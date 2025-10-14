/**
 * Project Detail Page Manager
 * Handles loading and displaying individual project details
 */

class ProjectDetailManager {
  constructor() {
    this.currentProjectId = null;
    this.projectData = null;
    this.allProjects = [];
    this.currentLanguage = localStorage.getItem('language') || 'en';
    
    this.init();
  }

  async init() {
    // Get project ID from URL
    this.currentProjectId = this.getProjectIdFromUrl();
    
    if (!this.currentProjectId) {
      this.showError('Project not found');
      return;
    }

    try {
      // Load project data
      await this.loadProjectData();
      
      // Render project content
      this.renderProjectContent();
      
      // Setup gallery
      this.setupGallery();
      
      // Load related projects
      this.loadRelatedProjects();
      
      // Setup animations
      this.setupAnimations();
      
    } catch (error) {
      console.error('Error loading project:', error);
      this.showError('Failed to load project details');
    }
  }

  getProjectIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || window.location.pathname.split('/').pop()?.replace('.html', '');
  }

  async loadProjectData() {
    try {
      const response = await fetch('/data/projects.json');
      if (!response.ok) throw new Error('Failed to load projects data');
      
      const data = await response.json();
      this.allProjects = data || [];
      
      // Find current project
      this.projectData = this.allProjects.find(p => p.id === this.currentProjectId);
      
      if (!this.projectData) {
        throw new Error('Project not found');
      }
      
    } catch (error) {
      console.error('Error loading project data:', error);
      throw error;
    }
  }

  renderProjectContent() {
    if (!this.projectData) return;

    const project = this.projectData;
    const content = project.i18n[this.currentLanguage] || project.i18n.en;
    
    // Update page title and meta
    document.title = `${content.title} - City Expert Project Details | UAE`;
    
    // Update breadcrumb
    const breadcrumb = document.getElementById('project-breadcrumb');
    if (breadcrumb) {
      breadcrumb.textContent = content.title;
    }
    
    // Update project category
    const categoryEl = document.getElementById('project-category');
    if (categoryEl) {
      categoryEl.textContent = this.formatCategory(project.category);
    }
    
    // Update project title
    const titleEl = document.getElementById('project-title');
    if (titleEl) {
      titleEl.textContent = content.title;
    }
    
    // Update project excerpt
    const excerptEl = document.getElementById('project-excerpt');
    if (excerptEl) {
      excerptEl.textContent = content.excerpt;
    }
    
    // Update project stats
    this.renderProjectStats(project);
    
    // Update hero image
    this.renderHeroImage(project);
    
    // Update project description
    this.renderProjectDescription(content);
    
    // Update meta tags
    this.updateMetaTags(project, content);
  }

  renderProjectStats(project) {
    const statsContainer = document.getElementById('project-stats');
    if (!statsContainer) return;
    
    const stats = [
      { 
        label: 'Location', 
        value: project.location || 'Dubai, UAE',
        icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
      },
      { 
        label: 'Completion', 
        value: project.completionDate || '2024',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      },
      { 
        label: 'Category', 
        value: this.formatCategory(project.category),
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
      },
      { 
        label: 'Area', 
        value: project.area || 'Custom Size',
        icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5'
      }
    ];
    
    statsContainer.innerHTML = stats.map(stat => `
      <div class="bg-white p-6 rounded-lg shadow-soft border border-warm-stone/20">
        <div class="flex items-center space-x-3 mb-2">
          <div class="w-8 h-8 bg-oasis-teal/10 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-oasis-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${stat.icon}"></path>
            </svg>
          </div>
          <h3 class="text-sm font-medium text-deep-charcoal/60 uppercase tracking-wider">${stat.label}</h3>
        </div>
        <p class="text-lg font-semibold text-deep-charcoal">${stat.value}</p>
      </div>
    `).join('');
  }

  renderHeroImage(project) {
    const heroContainer = document.getElementById('project-hero-container');
    if (!heroContainer || !project.media?.gallery?.length) return;
    
    const heroImage = project.media.gallery[0];
    
    heroContainer.innerHTML = `
      <div class="relative overflow-hidden rounded-2xl shadow-strong">
        <img
          src="${heroImage.url}"
          alt="${heroImage.alt?.[this.currentLanguage] || heroImage.alt?.en || project.i18n.en.title}"
          class="w-full h-96 object-cover transition-transform duration-500 hover:scale-105"
          loading="eager"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-deep-charcoal/20 to-transparent"></div>
        <div class="absolute bottom-6 left-6 right-6">
          <div class="bg-white/90 backdrop-blur-sm rounded-lg p-4">
            <p class="text-sm text-deep-charcoal/80">
              ${project.media.gallery.length} ${project.media.gallery.length === 1 ? 'Image' : 'Images'} Available
            </p>
          </div>
        </div>
      </div>
    `;
  }

  renderProjectDescription(content) {
    const descriptionEl = document.getElementById('project-description');
    if (!descriptionEl || !content.description) return;
    
    // Convert description to HTML if it's an array of paragraphs
    let description = content.description;
    if (Array.isArray(description)) {
      description = description.map(p => `<p class="mb-6">${p}</p>`).join('');
    } else {
      description = `<p class="mb-6">${description}</p>`;
    }
    
    descriptionEl.innerHTML = description;
  }

  setupGallery() {
    const gallery = document.getElementById('project-gallery');
    if (!gallery || !this.projectData?.media?.gallery?.length) return;
    
    const images = this.projectData.media.gallery;
    
    gallery.innerHTML = images.map((image, index) => `
      <div class="group cursor-pointer" data-image-index="${index}">
        <div class="relative overflow-hidden rounded-lg shadow-soft bg-gray-100">
          <img
            src="${image.url}"
            alt="${image.alt?.[this.currentLanguage] || image.alt?.en || `Project image ${index + 1}`}"
            class="w-full h-64 object-cover transition-all duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-deep-charcoal/0 group-hover:bg-deep-charcoal/20 transition-colors duration-300"></div>
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-deep-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
              </svg>
            </div>
          </div>
        </div>
        ${image.caption ? `<p class="text-sm text-deep-charcoal/70 mt-3">${image.caption}</p>` : ''}
      </div>
    `).join('');
    
    // Add click handlers for gallery lightbox
    this.setupGalleryLightbox(images);
  }

  setupGalleryLightbox(images) {
    const galleryItems = document.querySelectorAll('[data-image-index]');
    
    galleryItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const index = parseInt(item.dataset.imageIndex);
        this.openLightbox(images, index);
      });
    });
  }

  openLightbox(images, startIndex = 0) {
    let currentIndex = startIndex;
    
    // Create lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'fixed inset-0 z-50 bg-deep-charcoal/95 flex items-center justify-center p-4';
    lightbox.innerHTML = `
      <div class="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center">
        <button class="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10" id="close-lightbox">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        ${images.length > 1 ? `
        <button class="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors" id="prev-image">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button class="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors" id="next-image">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        ` : ''}
        
        <div class="w-full h-full flex items-center justify-center">
          <img id="lightbox-image" src="${images[currentIndex].url}" alt="${images[currentIndex].alt?.[this.currentLanguage] || images[currentIndex].alt?.en || 'Project image'}" class="max-w-full max-h-full object-contain">
        </div>
        
        ${images.length > 1 ? `
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
          <span id="image-counter">${currentIndex + 1} / ${images.length}</span>
        </div>
        ` : ''}
      </div>
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // Event handlers
    const updateImage = () => {
      const img = lightbox.querySelector('#lightbox-image');
      const counter = lightbox.querySelector('#image-counter');
      
      img.src = images[currentIndex].url;
      img.alt = images[currentIndex].alt?.[this.currentLanguage] || images[currentIndex].alt?.en || 'Project image';
      
      if (counter) {
        counter.textContent = `${currentIndex + 1} / ${images.length}`;
      }
    };
    
    lightbox.querySelector('#close-lightbox')?.addEventListener('click', () => {
      document.body.removeChild(lightbox);
      document.body.style.overflow = '';
    });
    
    if (images.length > 1) {
      lightbox.querySelector('#prev-image')?.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
      });
      
      lightbox.querySelector('#next-image')?.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
      });
    }
    
    // Keyboard navigation
    const handleKeyboard = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(lightbox);
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyboard);
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
      }
    };
    
    document.addEventListener('keydown', handleKeyboard);
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        document.body.removeChild(lightbox);
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyboard);
      }
    });
  }

  loadRelatedProjects() {
    const relatedContainer = document.getElementById('related-projects');
    if (!relatedContainer) return;
    
    // Get projects in same category, excluding current project
    const relatedProjects = this.allProjects
      .filter(p => p.id !== this.currentProjectId && p.category === this.projectData.category)
      .slice(0, 3);
    
    // If not enough in same category, add from other categories
    if (relatedProjects.length < 3) {
      const otherProjects = this.allProjects
        .filter(p => p.id !== this.currentProjectId && p.category !== this.projectData.category)
        .slice(0, 3 - relatedProjects.length);
      
      relatedProjects.push(...otherProjects);
    }
    
    if (relatedProjects.length === 0) {
      relatedContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-deep-charcoal/60">No related projects found.</p>
          <a href="/src/projects.html" class="btn btn-primary mt-4">View All Projects</a>
        </div>
      `;
      return;
    }
    
    relatedContainer.innerHTML = relatedProjects.map(project => {
      const content = project.i18n[this.currentLanguage] || project.i18n.en;
      const heroImage = project.media?.gallery?.[0];
      
      return `
        <article class="group cursor-pointer">
          <a href="project-detail.html?id=${project.id}" class="block">
            <div class="relative overflow-hidden rounded-lg shadow-soft bg-gray-100 mb-4">
              ${heroImage ? `
                <img
                  src="${heroImage.url}"
                  alt="${heroImage.alt?.[this.currentLanguage] || heroImage.alt?.en || content.title}"
                  class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ` : `
                <div class="w-full h-64 bg-gradient-to-br from-oasis-teal/20 to-brand-orange/20 flex items-center justify-center">
                  <span class="text-deep-charcoal/40 text-lg">No Image</span>
                </div>
              `}
              <div class="absolute inset-0 bg-deep-charcoal/0 group-hover:bg-deep-charcoal/10 transition-colors duration-300"></div>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-brand-orange font-medium uppercase tracking-wider">
                  ${this.formatCategory(project.category)}
                </span>
              </div>
              
              <h3 class="text-xl font-playfair font-medium group-hover:text-oasis-teal transition-colors">
                ${content.title}
              </h3>
              
              <p class="text-deep-charcoal/70 line-clamp-2">
                ${content.excerpt}
              </p>
              
              <div class="flex items-center text-oasis-teal font-medium group-hover:translate-x-1 transition-transform">
                <span class="text-sm">View Project</span>
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </a>
        </article>
      `;
    }).join('');
  }

  setupAnimations() {
    // Simple animation observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate="fade-up"]').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  updateMetaTags(project, content) {
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (ogTitle) ogTitle.content = `${content.title} - City Expert`;
    if (ogDescription) ogDescription.content = content.excerpt;
    if (ogImage && project.images?.[0]) ogImage.content = project.images[0].url;
    
    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    
    if (twitterTitle) twitterTitle.content = content.title;
    if (twitterDescription) twitterDescription.content = content.excerpt;
    if (twitterImage && project.images?.[0]) twitterImage.content = project.images[0].url;
  }

  formatCategory(category) {
    const categoryMap = {
      'residential': 'Residential',
      'commercial': 'Commercial',
      'interior': 'Interior Design',
      'renovation': 'Renovation',
      'villa': 'Villa',
      'apartment': 'Apartment',
      'office': 'Office',
      'retail': 'Retail'
    };
    
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  showError(message) {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <section class="min-h-screen flex items-center justify-center bg-warm-stone/30">
          <div class="text-center max-w-md mx-auto px-6">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-playfair font-medium mb-4">Project Not Found</h1>
            <p class="text-deep-charcoal/70 mb-8">${message}</p>
            <div class="space-y-4">
              <a href="projects.html" class="btn btn-primary">View All Projects</a>
              <a href="../index.html" class="btn btn-secondary">Go Home</a>
            </div>
          </div>
        </section>
      `;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProjectDetailManager();
});

export default ProjectDetailManager;