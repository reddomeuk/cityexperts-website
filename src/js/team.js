// team.js - Dynamic team members loading for About Us page

class TeamRenderer {
  constructor() {
    this.teamMembers = [];
    this.currentLang = document.documentElement.lang || 'en';
  }

  async loadTeamMembers() {
    try {
      
      const response = await fetch('/api/team?status=active');
      
      if (response.ok) {
        const data = await response.json();
        this.teamMembers = data.data || [];
        this.renderTeamGrid();
      } else {
        console.error('Failed to load team members:', response.status);
        this.showError('Failed to load team members');
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      this.showError('Error loading team members: ' + error.message);
    }
  }

  renderTeamGrid() {
    const teamGrid = document.querySelector('.leadership-grid');
    if (!teamGrid) {
      return;
    }

    if (this.teamMembers.length === 0) {
      teamGrid.innerHTML = '<div style="text-align:center;padding:40px;color:#6b7280">No team members found.</div>';
      return;
    }

    const teamCards = this.teamMembers.map((member, index) => 
      this.createTeamCard(member, index)
    ).join('');

    teamGrid.innerHTML = teamCards;
  }

  createTeamCard(member, index) {
    const content = member.i18n[this.currentLang] || member.i18n.en;
    const portraitUrl = member.media.portrait?.url || 'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_400,h_400,g_face,q_auto,f_auto/sample.jpg';
    const altText = member.media.portrait?.alt?.[this.currentLang] || member.media.portrait?.alt?.en || content.name;
    
    // Generate responsive image URLs
    const responsiveImages = {
      small: portraitUrl.replace(/\/upload\/.*?\//, '/upload/c_fill,w_300,h_300,q_auto,f_auto/'),
      medium: portraitUrl.replace(/\/upload\/.*?\//, '/upload/c_fill,w_400,h_400,q_auto,f_auto/'),
      large: portraitUrl.replace(/\/upload\/.*?\//, '/upload/c_fill,w_500,h_500,q_auto,f_auto/')
    };

    const animationDelay = (index + 1) * 100;

    return `
      <div class="leadership-card card card-hover p-0 overflow-hidden group w-full max-w-sm" data-animate="fade-up" data-animate-delay="${animationDelay}">
        <div class="relative overflow-hidden">
          <picture>
            <source media="(min-width: 768px)" srcset="${responsiveImages.large}">
            <source media="(min-width: 640px)" srcset="${responsiveImages.medium}">
            <img 
              src="${responsiveImages.small}"
              srcset="${responsiveImages.small} 300w, ${responsiveImages.medium} 400w, ${responsiveImages.large} 500w"
              sizes="(min-width: 768px) 400px, (min-width: 640px) 350px, 300px"
              alt="${altText}"
              width="400"
              height="400"
              class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            >
          </picture>
          <div class="absolute inset-0 bg-gradient-to-t from-deep-charcoal/80 via-transparent to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 class="text-xl font-semibold mb-1">${content.name}</h3>
            <p class="text-brand-orange font-medium mb-2">${content.position}</p>
            <p class="text-sm text-white/80">${content.expertise || ''}</p>
          </div>
        </div>
        <div class="p-6">
          <p class="text-deep-charcoal/70 leading-relaxed">
            ${content.bio}
          </p>
          ${this.generateContactLinks(member)}
        </div>
      </div>
    `;
  }

  generateContactLinks(member) {
    const links = [];
    
    if (member.contact.email) {
      links.push(`<a href="mailto:${member.contact.email}" class="text-oasis-teal hover:text-oasis-teal/80 transition-colors" aria-label="Email ${member.i18n[this.currentLang]?.name || member.i18n.en.name}">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
        </svg>
      </a>`);
    }
    
    if (member.contact.linkedin) {
      links.push(`<a href="${member.contact.linkedin}" target="_blank" rel="noopener noreferrer" class="text-oasis-teal hover:text-oasis-teal/80 transition-colors" aria-label="LinkedIn profile of ${member.i18n[this.currentLang]?.name || member.i18n.en.name}">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd"></path>
        </svg>
      </a>`);
    }
    
    if (links.length > 0) {
      return `<div class="flex space-x-3 mt-4">${links.join('')}</div>`;
    }
    
    return '';
  }

  showError(message) {
    const teamGrid = document.querySelector('.leadership-grid');
    if (teamGrid) {
      teamGrid.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444">${message}</div>`;
    }
  }
}

// Initialize team loading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on About page
  if (document.querySelector('.leadership-grid')) {
    const teamRenderer = new TeamRenderer();
    teamRenderer.loadTeamMembers();
  }
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TeamRenderer;
}