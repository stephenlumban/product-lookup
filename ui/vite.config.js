import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    port: 80,
    // Add this array to allow your custom domain
    allowedHosts: [
      'product-lookup.n-compass.online'
    ]
  },
})
