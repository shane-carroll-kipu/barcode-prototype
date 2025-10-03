import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Needed for GitHub Pages project site: https://<user>.github.io/<repo>/
  base: '/barcode-prototype/',
})
