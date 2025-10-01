// Projects Page JavaScript
// Handle project loading from API and filtering

class ProjectsRenderer {
  constructor() {
    this.projects = [];
    this.filteredProjects = [];
    this.currentLang = document.documentElement.lang || 'en';
    this.currentFilter = 'all';
    this.projectsGrid = document.querySelector('#projects-grid');
    this.filterButtons = document.querySelectorAll('[data-filter]');
    this.languageButtons = document.querySelectorAll('[id^="lang-"]');
    
    this.init();
  }

  async init() {
    await this.loadProjects();
    this.setupFilters();
    this.setupLanguageToggle();
    this.renderProjects();
  }

  async loadProjects() {
    try {
      // Load all published projects from API - no mock data
      let response;
      try {
        response = await fetch('/api/projects?status=published&sort=order:asc,createdAt:desc');
        if (response.ok) {
          const data = await response.json();
          this.projects = data.data || [];
        } else {
          throw new Error('API Error: ' + response.status);
        }
      } catch (apiError) {
        console.error('Failed to load projects:', apiError);
        this.showError('Failed to load projects: ' + apiError.message);
        return;
      }
      
      this.filteredProjects = [...this.projects];
      
      if (this.projects.length > 0) {
        this.renderProjects();
      }
    } catch (error) {
      console.error('💥 Failed to load projects:', error);
      this.showError('Failed to load projects: ' + error.message);
    }
  }

  setupFilters() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        if (filter) {
          this.filterProjects(filter);
          this.setActiveFilter(filter);
        }
      });
    });
  }

  setupLanguageToggle() {
    this.languageButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const lang = e.target.id.replace('lang-', '');
        this.setLanguage(lang);
      });
    });
  }

  setActiveFilter(filter) {
    this.currentFilter = filter;
    
    // Update active state for filter buttons
    this.filterButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    document.querySelector('[data-filter="' + filter + '"]').classList.add('active');
    document.querySelector('[data-filter="' + filter + '"]').setAttribute('aria-pressed', 'true');
  }

  setLanguage(lang) {
    this.currentLang = lang;
    
    // Update active language button
    document.querySelectorAll('[id^="lang-"]').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById('lang-' + lang)?.classList.add('active');
    
    this.renderProjects();
  }

  filterProjects(filter) {
    if (filter === 'all') {
      this.filteredProjects = [...this.projects];
    } else {
      this.filteredProjects = this.projects.filter(project => 
        project.category === filter
      );
    }
    this.renderProjects();
  }

  renderProjects() {
    if (!this.projectsGrid) return;

    if (this.filteredProjects.length === 0) {
      this.projectsGrid.innerHTML = 
        '<div class="col-span-full text-center py-12">' +
        '<h3 class="text-xl font-semibold text-deep-charcoal mb-4">No projects found</h3>' +
        '<p class="text-deep-charcoal/70">Try selecting a different category.</p>' +
        '</div>';
      return;
    }

    const projectCards = this.filteredProjects.map((project, index) => 
      this.createProjectCard(project, index)
    ).join('');

    this.projectsGrid.innerHTML = projectCards;
    
    // Re-trigger animations if available
    if (window.animations) {
      window.animations.initScrollAnimations();
    }
  }

  createProjectCard(project, index) {
    const lang = this.currentLang;
    const content = project.i18n?.[lang] || project.i18n?.en || {};
    const media = project.media || {};
    
    // Only use Cloudinary URLs - skip projects without proper images
    let heroImage, heroAlt;
    if (media.heroWide?.url && media.heroWide.url.includes('res.cloudinary.com')) {
      heroImage = media.heroWide.url;
      heroAlt = media.heroWide.alt?.[lang] || media.heroWide.alt?.en || content.title;
    } else if (media.hero?.url && media.hero.url.includes('res.cloudinary.com')) {
      heroImage = media.hero.url;
      heroAlt = media.hero.alt?.[lang] || media.hero.alt?.en || content.title;
    } else if (media.thumb?.url && media.thumb.url.includes('res.cloudinary.com')) {
      heroImage = media.thumb.url;
      heroAlt = media.thumb.alt?.[lang] || media.thumb.alt?.en || content.title;
    } else {
      // Skip projects without valid Cloudinary images
      return '';
    }

    // Generate Cloudinary transformations
    const baseUrl = heroImage.split('/upload/')[0] + '/upload/';
    const publicId = heroImage.split('/upload/')[1].split('?')[0];
    
    const transforms = {
      small: baseUrl + 'c_fill,w_400,h_300,q_auto,f_auto/',
      medium: baseUrl + 'c_fill,w_600,h_400,q_auto,f_auto/',
      large: baseUrl + 'c_fill,w_800,h_600,q_auto,f_auto/'
    };

    return '<article class="project-card group" data-category="' + project.category + '" data-aos="fade-up" data-aos-delay="' + (index * 100) + '">' +
      '<div class="relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">' +
      '<div class="relative aspect-[4/3] overflow-hidden">' +
      '<picture>' +
      '<source media="(min-width: 768px)" srcset="' + transforms.large + publicId + '">' +
      '<source media="(min-width: 480px)" srcset="' + transforms.medium + publicId + '">' +
      '<img src="' + transforms.small + publicId + '" ' +
      'srcset="' + transforms.small + publicId + ' 400w, ' + transforms.medium + publicId + ' 600w, ' + transforms.large + publicId + ' 800w" ' +
      'sizes="(min-width: 1024px) 350px, (min-width: 768px) 300px, 400px" ' +
      'alt="' + this.escapeHtml(heroAlt) + '" ' +
      'width="800" height="600" ' +
      'loading="lazy" decoding="async" ' +
      'class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">' +
      '</picture>' +
      '<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>' +
      '<div class="absolute top-4 left-4">' +
      '<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + this.getCategoryClass(project.category) + '">' +
      this.formatCategory(project.category) +
      '</span>' +
      '</div>' +
      (project.featured ? '<div class="absolute top-4 right-4"><span class="inline-flex items-center px-2 py-1 bg-brand-orange text-white rounded-full text-xs font-medium">Featured</span></div>' : '') +
      '</div>' +
      '<div class="p-6">' +
      '<div class="mb-3">' +
      '<h3 class="text-xl font-semibold text-deep-charcoal mb-2 group-hover:text-oasis-teal transition-colors">' +
      this.escapeHtml(content.title || 'Untitled Project') +
      '</h3>' +
      '<p class="text-sm text-deep-charcoal/60 mb-1">' + this.escapeHtml(project.city || '') + '</p>' +
      '</div>' +
      '<p class="text-deep-charcoal/70 mb-4 line-clamp-3">' +
      this.escapeHtml(content.excerpt || content.description || '') +
      '</p>' +
      '<div class="flex items-center justify-between">' +
      '<a href="/projects.html#' + project.id + '" ' +
      'class="inline-flex items-center text-oasis-teal hover:text-deep-charcoal font-medium transition-colors group/link"' +
      'aria-label="View details for ' + this.escapeHtml(content.title) + '">' +
      'View Details' +
      '<svg class="ml-2 w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>' +
      '</svg>' +
      '</a>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</article>';
  }

  formatCategory(category) {
    const categoryMap = {
      'residential': 'Residential',
      'commercial': 'Commercial', 
      'hospitality': 'Hospitality',
      'retail': 'Retail',
      'mixed-use': 'Mixed Use',
      'office': 'Office',
      'public': 'Public',
      'interiors': 'Interiors',
      'interior': 'Interiors'
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  getCategoryClass(category) {
    const classMap = {
      'residential': 'bg-oasis-teal text-white',
      'interiors': 'bg-purple-600 text-white',
      'interior': 'bg-purple-600 text-white',
      'mixed': 'bg-green-600 text-white',
      'mixed-use': 'bg-green-600 text-white',
      'hospitality': 'bg-blue-600 text-white',
      'retail': 'bg-pink-600 text-white',
      'corporate': 'bg-gray-600 text-white'
    };
    return classMap[category] || 'bg-gray-500 text-white';
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showError(message) {
    if (!this.projectsGrid) return;
    this.projectsGrid.innerHTML = 
      '<div class="col-span-full text-center py-12">' +
      '<div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">' +
      '<h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Projects</h3>' +
      '<p class="text-red-600">' + message + '</p>' +
      '<button onclick="location.reload()" class="mt-4 btn btn-secondary">Retry</button>' +
      '</div>' +
      '</div>';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProjectsRenderer();
  loadSpotlightProject();
});

// Load and render spotlight project for featured section
async function loadSpotlightProject() {
  const spotlightSection = document.querySelector('[data-spotlight-project]');
  if (!spotlightSection) return;

  try {
    const response = await fetch('/api/projects?spotlight=true&limit=1');
    if (!response.ok) {
      throw new Error('API Error: ' + response.status);
    }
    
    const data = await response.json();
    const project = data.data?.[0];
    
    if (project) {
      renderSpotlightProject(project);
    }
  } catch (error) {
    console.error('Failed to load spotlight project:', error);
    // Keep existing hardcoded content as fallback
  }
}

// Render spotlight project content
function renderSpotlightProject(project) {
  const currentLang = document.documentElement.lang || 'en';
  const content = project.i18n[currentLang] || project.i18n.en;
  
  const spotlightSection = document.querySelector('[data-spotlight-project]');
  if (!spotlightSection) return;
  
  // Build stats from project data
  const stats = [];
  if (project.floors) stats.push({ value: project.floors, label: 'Floors' });
  if (project.units) stats.push({ value: project.units, label: 'Units' });
  if (project.timeline) stats.push({ value: project.timeline, label: 'Months' });
  if (project.completion) stats.push({ value: project.completion, label: 'Completion' });
  
  const statsHtml = stats.map(stat => 
    `<div class="text-center">
      <div class="text-2xl font-bold text-brand-orange mb-1">${stat.value}</div>
      <div class="text-sm text-deep-charcoal/70">${stat.label}</div>
    </div>`
  ).join('');
  
  spotlightSection.innerHTML = `
    <div class="container-custom">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div data-animate="fade-up">
          <div class="flex items-center space-x-4 mb-6">
            <div class="w-12 h-px bg-brand-orange"></div>
            <span class="text-brand-orange font-medium uppercase tracking-wider">Featured Project</span>
          </div>
          
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-playfair font-medium mb-8">
            ${content.title}
          </h2>
          
          <div class="space-y-6 text-lg text-deep-charcoal/80 leading-relaxed">
            <p>${content.excerpt}</p>
            
            ${stats.length > 0 ? `<div class="grid grid-cols-2 gap-6 py-6">${statsHtml}</div>` : ''}
          </div>
          
          <a href="/projects/${project.id}.html" class="btn btn-primary btn-large">
            Explore This Project
          </a>
        </div>
        
        <div class="relative" data-animate="fade-up" data-animate-delay="200">
          <img 
            src="${project.media.hero.url}" 
            alt="${project.media.hero.alt[currentLang] || project.media.hero.alt.en}"
            class="w-full h-auto rounded-2xl shadow-strong"
            loading="lazy"
          >
          <div class="absolute -bottom-6 -right-6 bg-brand-orange text-white p-6 rounded-2xl shadow-strong">
            <div class="text-2xl font-bold mb-1">Featured</div>
            <div class="text-sm uppercase tracking-wider">Project</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Export for potential external use
window.ProjectsRenderer = ProjectsRenderer;