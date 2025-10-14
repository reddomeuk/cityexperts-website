// Enhanced Projects Manager
class ProjectManager {
  constructor() {
    this.allProjects = [];
    this.projectsContainer = document.getElementById('projects-grid');
    this.spotlightContainer = document.querySelector('[data-spotlight-project]');
    this.init();
  }

  async init() {
    try {
      await this.loadProjects();
      this.renderProjects();
      this.renderFeaturedSpotlight();
      this.setupCardClicks();
    } catch (error) {
      console.error('Error loading projects:', error);
      this.showError(error.message);
    }
  }

  async loadProjects() {
    try {
      // First try to load from localStorage (admin changes)
      const savedProjects = localStorage.getItem('cityexperts_projects');
      if (savedProjects) {
        this.allProjects = JSON.parse(savedProjects);
        console.log('Successfully loaded', this.allProjects.length, 'projects from localStorage (admin changes)');
        return;
      }
      
      // Fall back to original JSON file
      console.log('Loading projects from /data/projects.json');
      const response = await fetch('/data/projects.json');
      
      if (!response.ok) {
        console.error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
        console.error('Response URL:', response.url);
        
        // Try to get the response text to see what we actually received
        const responseText = await response.text();
        console.error('Response content:', responseText.substring(0, 200));
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Check if /data/projects.json exists on the server.`);
      }
      
      const responseText = await response.text();
      console.log('Raw response length:', responseText.length);
      console.log('Response starts with:', responseText.substring(0, 100));
      
      try {
        this.allProjects = JSON.parse(responseText);
        console.log('Successfully loaded', this.allProjects.length, 'projects from JSON file');
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response that failed to parse:', responseText.substring(0, 500));
        throw new Error(`Failed to parse projects JSON: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      throw error;
    }
  }

  renderProjects() {
    if (!this.projectsContainer) return;
    
    // Filter for published projects only
    const publishedProjects = this.allProjects.filter(project => 
      project.status === 'published' || project.status === undefined // undefined for legacy projects
    );
    
    console.log(`Rendering ${publishedProjects.length} published projects out of ${this.allProjects.length} total projects`);
    
    this.projectsContainer.innerHTML = publishedProjects.map(project => {
      const content = project.i18n?.en || {};
      const image = project.media?.gallery?.[0] || project.media?.hero || project.media?.thumb;
      
      return `
        <article class="project-card group cursor-pointer transition-all duration-300 hover:scale-105" data-project-id="${project.id}">
          <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden relative">
            ${project.featured ? `
              <div class="absolute top-4 left-4 z-10">
                <span class="bg-brand-orange text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                  Featured
                </span>
              </div>
            ` : ''}
            <div class="h-64 overflow-hidden">
              <img 
                src="${image?.url || '/assets/images/placeholder.jpg'}" 
                alt="${content.title || 'Project'}" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm text-blue-600 font-medium uppercase tracking-wider">${project.category}</span>
                <span class="text-sm text-gray-500">${project.completion || '2024'}</span>
              </div>
              <h3 class="text-xl font-semibold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">${content.title || 'Project'}</h3>
              <p class="text-gray-600 text-sm leading-relaxed mb-4">${content.excerpt || 'Professional construction and design project.'}</p>
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                  <span>${project.city || 'Dubai'}</span>
                  ${project.area ? ` • ${project.area}` : ''}
                </div>
                <div class="text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  View Details →
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  renderFeaturedSpotlight() {
    if (!this.spotlightContainer) return;
    
    // Find published projects only, then look for spotlight project
    const publishedProjects = this.allProjects.filter(project => 
      project.status === 'published' || project.status === undefined // undefined for legacy projects
    );
    
    // Find the spotlight project (first published project with spotlight: true)
    const spotlightProject = publishedProjects.find(project => project.spotlight === true) ||
                            publishedProjects.find(project => project.featured === true); // fallback to featured
    
    if (!spotlightProject) {
      console.log('No spotlight or featured project found in published projects');
      return;
    }
    
    console.log('Rendering spotlight project:', spotlightProject.i18n?.en?.title || spotlightProject.id);
    
    const content = spotlightProject.i18n?.en || {};
    const heroImage = spotlightProject.media?.hero || spotlightProject.media?.gallery?.[0] || spotlightProject.media?.thumb;
    
    this.spotlightContainer.innerHTML = `
      <div class="container-custom">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div class="space-y-8">
            <div class="space-y-4">
              <span class="text-brand-orange font-medium uppercase tracking-wider">Featured Project</span>
              <div class="space-y-6">
                <h2 class="text-4xl lg:text-5xl xl:text-6xl font-playfair font-medium leading-tight">
                  ${content.title || spotlightProject.id}
                </h2>
                <p class="text-lg text-deep-charcoal/80 leading-relaxed">
                  ${content.excerpt || content.description?.substring(0, 200) + '...' || 'Featured construction project showcasing our expertise and attention to detail.'}
                </p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-6 text-sm">
              <div class="space-y-2">
                <span class="text-deep-charcoal/60 uppercase tracking-wider">Location</span>
                <p class="font-medium">${spotlightProject.city || 'Dubai, UAE'}</p>
              </div>
              <div class="space-y-2">
                <span class="text-deep-charcoal/60 uppercase tracking-wider">Completion</span>
                <p class="font-medium">${spotlightProject.completion || '2024'}</p>
              </div>
              <div class="space-y-2">
                <span class="text-deep-charcoal/60 uppercase tracking-wider">Category</span>
                <p class="font-medium capitalize">${spotlightProject.category || 'Construction'}</p>
              </div>
              <div class="space-y-2">
                <span class="text-deep-charcoal/60 uppercase tracking-wider">Area</span>
                <p class="font-medium">${spotlightProject.area || 'Large Scale'}</p>
              </div>
            </div>
            
            <div class="pt-4">
              <a href="project-detail.html?id=${spotlightProject.id}" 
                 class="inline-flex items-center gap-3 bg-deep-charcoal text-white px-8 py-4 rounded-lg font-medium hover:bg-deep-charcoal/90 transition-all duration-300 group">
                <span>View Project Details</span>
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div class="relative">
            <div class="aspect-[4/3] relative overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="${heroImage?.url || '/assets/images/placeholder.jpg'}" 
                alt="${content.title || 'Featured Project'}" 
                class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-deep-charcoal/30 to-transparent"></div>
              ${spotlightProject.media?.gallery?.length ? `
                <div class="absolute bottom-6 right-6">
                  <div class="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span class="text-sm font-medium text-deep-charcoal">
                      ${spotlightProject.media.gallery.length} Images Available
                    </span>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupCardClicks() {
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      if (card) {
        const projectId = card.dataset.projectId;
        if (projectId) {
          window.location.href = `project-detail.html?id=${projectId}`;
        }
      }
    });
  }

  showError(message) {
    if (this.projectsContainer) {
      this.projectsContainer.innerHTML = `
        <div class="col-span-full text-center py-16">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Error Loading Projects</h3>
          <p class="text-gray-600 mb-6">${message}</p>
          <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Try Again
          </button>
        </div>
      `;
    }
  }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  new ProjectManager();
});
