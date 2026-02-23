import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/shared': path.resolve(__dirname, './src/shared'),
        '@/modules': path.resolve(__dirname, './src/modules'),
      },
    },
    server: {
      port: Number(env.PORT) || Number(env.VITE_PORT) || 5173,
      hmr: {
        overlay: false,
      },
    },
  }
})
