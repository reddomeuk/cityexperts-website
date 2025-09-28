import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: 'src/index.html',
        about: 'src/about.html',
        projects: 'src/projects.html',
        contact: 'src/contact.html',
        admin: 'src/admin.html'
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