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
});

// Export for potential external use
window.ProjectsRenderer = ProjectsRenderer;