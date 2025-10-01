// Projects Page JavaScript
// Handle project filtering and interactions

class ProjectsManager {
  constructor() {
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.projectCards = document.querySelectorAll('.project-card');
    this.loadMoreBtn = document.getElementById('load-more-btn');
    this.projectsGrid = document.getElementById('projects-grid');
    
    this.currentFilter = 'all';
    this.projectsLoaded = 6; // Initially show 6 projects
    this.projectsPerLoad = 6; // Load 6 more each time
    
    this.init();
  }
  
  init() {
    this.initFilterButtons();
    this.initLoadMore();
    this.initProjectCardAnimations();
    this.updateVisibleProjects();
  }
  
  initFilterButtons() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active state
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Get filter value
        this.currentFilter = button.dataset.filter;
        
        // Filter projects
        this.filterProjects();
        
        // Reset load more
        this.projectsLoaded = 6;
        this.updateVisibleProjects();
      });
    });
  }
  
  filterProjects() {
    this.projectCards.forEach(card => {
      const category = card.dataset.category;
      const shouldShow = this.currentFilter === 'all' || category === this.currentFilter;
      
      if (shouldShow) {
        card.style.display = 'block';
        // Add animation
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 100);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
  }
  
  initLoadMore() {
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => {
        this.loadMoreProjects();
      });
    }
  }
  
  loadMoreProjects() {
    // Simulate loading more projects
    const newProjects = this.generateAdditionalProjects();
    
    newProjects.forEach((project, index) => {
      setTimeout(() => {
        this.projectsGrid.appendChild(project);
        // Trigger animation
        setTimeout(() => {
          project.style.opacity = '1';
          project.style.transform = 'translateY(0)';
        }, 100);
      }, index * 100);
    });
    
    this.projectsLoaded += this.projectsPerLoad;
    
    // Hide load more button if we've loaded enough projects
    if (this.projectsLoaded >= 18) {
      this.loadMoreBtn.style.display = 'none';
    }
  }
  
  generateAdditionalProjects() {
    const additionalProjects = [
      {
        category: 'commercial',
        image: '/assets/images/projects/tech-hub.webp',
        title: 'Tech Hub Complex',
        location: 'Dubai Silicon Oasis',
        description: 'A state-of-the-art technology center featuring flexible office spaces, innovation labs, and collaborative work environments.',
        year: '2023',
        type: 'Commercial'
      },
      {
        category: 'residential',
        image: '/assets/images/projects/skyline-apartments.webp',
        title: 'Skyline Apartments',
        location: 'JLT',
        description: 'Modern apartment complex with panoramic city views, premium amenities, and sustainable design features.',
        year: '2022',
        type: 'Residential'
      },
      {
        category: 'interior',
        image: '/assets/images/projects/luxury-penthouse.webp',
        title: 'Luxury Penthouse',
        location: 'Burj Khalifa',
        description: 'Exclusive penthouse interior design featuring bespoke furniture, artwork curation, and smart home integration.',
        year: '2023',
        type: 'Interior Design'
      }
      // Add more projects as needed
    ];
    
    return additionalProjects.slice(0, Math.min(this.projectsPerLoad, additionalProjects.length)).map(project => {
      return this.createProjectCard(project);
    });
  }
  
  createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.category = project.category;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.3s ease';
    
    card.innerHTML = `
      <div class="card card-hover overflow-hidden group">
        <div class="relative overflow-hidden">
          <img 
            src="${project.image}"
            alt="${project.title} - ${project.description}"
            class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-deep-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute top-4 left-4">
            <span class="bg-brand-orange text-white px-3 py-1 rounded-full text-sm font-medium">${project.type}</span>
          </div>
          <div class="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold">${project.title}</h3>
                <p class="text-sm text-white/80">${project.location}</p>
              </div>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </div>
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2">${project.title}</h3>
          <p class="text-deep-charcoal/70 mb-4">
            ${project.description}
          </p>
          <div class="flex items-center justify-between text-sm">
            <span class="text-deep-charcoal/60">Completed: ${project.year}</span>
            <a href="/projects/${project.title.toLowerCase().replace(/\s+/g, '-')}.html" class="text-brand-orange hover:text-oasis-teal font-medium transition-colors">View Details →</a>
          </div>
        </div>
      </div>
    `;
    
    return card;
  }
  
  updateVisibleProjects() {
    const visibleProjects = Array.from(this.projectCards).filter(card => {
      const category = card.dataset.category;
      return this.currentFilter === 'all' || category === this.currentFilter;
    });
    
    // Show/hide load more button based on visible projects
    if (visibleProjects.length <= this.projectsLoaded) {
      this.loadMoreBtn.style.display = 'none';
    } else {
      this.loadMoreBtn.style.display = 'inline-flex';
    }
  }
  
  initProjectCardAnimations() {
    // Add hover effects for project cards
    this.projectCards.forEach(card => {
      const image = card.querySelector('img');
      const overlay = card.querySelector('.absolute.inset-0.bg-gradient-to-t');
      
      card.addEventListener('mouseenter', () => {
        if (image) {
          image.style.transform = 'scale(1.05)';
        }
      });
      
      card.addEventListener('mouseleave', () => {
        if (image) {
          image.style.transform = 'scale(1)';
        }
      });
    });
  }
}

// Counter Animation for Stats
class StatsCounter {
  constructor() {
    this.statsElements = document.querySelectorAll('[data-counter]');
    this.hasAnimated = false;
    this.init();
  }
  
  init() {
    this.observeStats();
  }
  
  observeStats() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.animateCounters();
          this.hasAnimated = true;
        }
      });
    }, { threshold: 0.5 });
    
    this.statsElements.forEach(element => {
      observer.observe(element);
    });
  }
  
  animateCounters() {
    this.statsElements.forEach(element => {
      const target = parseInt(element.dataset.counter);
      const suffix = element.dataset.suffix || '';
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
      }, duration / steps);
    });
  }
}

// Lightbox for project images
class ProjectLightbox {
  constructor() {
    this.lightbox = null;
    this.currentImageIndex = 0;
    this.images = [];
    this.init();
  }
  
  init() {
    this.createLightbox();
    this.bindImageClicks();
  }
  
  createLightbox() {
    this.lightbox = document.createElement('div');
    this.lightbox.className = 'lightbox fixed inset-0 bg-black/90 z-50 flex items-center justify-center opacity-0 invisible transition-all duration-300';
    
    this.lightbox.innerHTML = `
      <div class="relative max-w-4xl max-h-full p-4">
        <img class="lightbox-image max-w-full max-h-full object-contain" src="" alt="">
        <button class="lightbox-close absolute top-4 right-4 text-white hover:text-brand-orange text-2xl">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <button class="lightbox-prev absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-brand-orange text-2xl">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button class="lightbox-next absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-brand-orange text-2xl">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(this.lightbox);
    
    // Bind lightbox events
    this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
    this.lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prevImage());
    this.lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.nextImage());
    
    // Close on outside click
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.closeLightbox();
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.closeLightbox();
      }
    });
  }
  
  bindImageClicks() {
    const projectImages = document.querySelectorAll('.project-card img');
    projectImages.forEach((img, index) => {
      img.addEventListener('click', (e) => {
        e.preventDefault();
        this.openLightbox(img.src, index);
      });
    });
  }
  
  openLightbox(imageSrc, index = 0) {
    this.currentImageIndex = index;
    this.lightbox.querySelector('.lightbox-image').src = imageSrc;
    this.lightbox.classList.remove('opacity-0', 'invisible');
    document.body.style.overflow = 'hidden';
  }
  
  closeLightbox() {
    this.lightbox.classList.add('opacity-0', 'invisible');
    document.body.style.overflow = '';
  }
  
  isOpen() {
    return !this.lightbox.classList.contains('invisible');
  }
  
  prevImage() {
    // Implementation for previous image navigation
  }
  
  nextImage() {
    // Implementation for next image navigation
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProjectsManager();
  new StatsCounter();
  new ProjectLightbox();
});

export { ProjectsManager, StatsCounter, ProjectLightbox };