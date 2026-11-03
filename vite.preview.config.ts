// 미리보기용: 모든 파일(이미지 포함)을 HTML 한 장으로 묶어서 빌드해요.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-preview', assetsInlineLimit: 100_000_000 },
})
