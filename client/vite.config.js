import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const apiBaseUrl = env.VITE_API_BASE_URL || 'https://vhack-backend-branch.onrender.com'

    return {
        plugins: [react()],
        server: {
            port: 3000,
            proxy: {
                '/api': {
                    target: apiBaseUrl,
                    changeOrigin: true,
                }
            }
        }
    }
})
