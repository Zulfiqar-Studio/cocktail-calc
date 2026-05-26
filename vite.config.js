import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // <-- 這行是關鍵！強制使用相對路徑，網頁才不會走丟變白
})
