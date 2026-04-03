import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  
  const cspValue = isDev
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.googleusercontent.com; connect-src 'self' http://localhost:5173 http://localhost:3000 ws://localhost:5173 https://accounts.google.com https://*.googleusercontent.com; font-src 'self' data: https://fonts.gstatic.com; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://accounts.google.com;"
    : "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: blob:; connect-src 'self' https:; font-src 'self' data: https://fonts.gstatic.com; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';";

  return {
    plugins: [react()],
    server: {
      headers: {
        'Content-Security-Policy': cspValue,
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
      },
    },
  };
})