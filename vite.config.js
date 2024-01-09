import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// For Vite configuration options, refer to https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // Set the static asset directory to 'public'
    publicDir: 'public',
    // Set the path of the 'public' directory as the root path
    publicPath: '/',
  },
})
