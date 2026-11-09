// 팀 프로토타입(naver-1020-luck)용: 주파수 + 온보딩만, 이미지·폰트까지 HTML 한 장으로 (team.html → dist-team/index.html)
import { renameSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'team-html-to-index',
      closeBundle() {
        const out = resolve(__dirname, 'dist-team')
        renameSync(resolve(out, 'team.html'), resolve(out, 'index.html'))
      },
    },
  ],
  build: {
    outDir: 'dist-team',
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    rollupOptions: { input: resolve(__dirname, 'team.html') },
  },
})
