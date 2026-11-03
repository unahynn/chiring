import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 주소(unahynn.github.io/chiring/)에서 열리도록 배포할 때만 경로를 붙여요
  base: process.env.GITHUB_PAGES ? '/chiring/' : '/',
})
