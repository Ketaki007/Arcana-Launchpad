import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages project URL: https://ketaki007.github.io/Arcana-Launchpad/
  base: process.env.GITHUB_PAGES === 'true' ? '/Arcana-Launchpad/' : '/',
  plugins: [react(), tailwindcss()],
})
