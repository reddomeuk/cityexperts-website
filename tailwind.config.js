/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-charcoal': '#111315',
        'brand-orange': '#FF8000',
        'warm-stone': '#E8E3DB',
        'oasis-teal': '#0F8B8D',
        'pure-white': '#FFFFFF'
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'cinzel': ['Cinzel', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'parallax': 'parallax 20s linear infinite',
        'count-up': 'countUp 2s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        parallax: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-50px)' }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(17, 19, 21, 0.08)',
        'medium': '0 8px 32px rgba(17, 19, 21, 0.12)',
        'strong': '0 16px 48px rgba(17, 19, 21, 0.16)'
      },
      screens: {
        'xs': '475px'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
}