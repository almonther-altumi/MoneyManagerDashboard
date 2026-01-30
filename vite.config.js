import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteCompression()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['chart.js', 'react-chartjs-2'],
          utils: ['jspdf', 'html2canvas', 'i18next', 'react-i18next']
        }
      }
    }
  }
})
