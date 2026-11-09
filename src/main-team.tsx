import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css'
import './index.css'
import TeamApp from './TeamApp.tsx'

// 팀 프로토타입용 시작점 (team.html) — 주파수 + 온보딩만
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TeamApp />
  </StrictMode>,
)
