import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    headers: {
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' http://localhost:3000 ws://localhost:5173; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    },
  },
});