import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'src/index.html',
        about: 'src/about.html',
        projects: 'src/projects.html',
        contact: 'src/contact.html',
        admin: 'src/admin.html',
        services: 'src/services.html',
        'project-detail': 'src/project-detail.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  css: {
    postcss: './postcss.config.js'
  }
});