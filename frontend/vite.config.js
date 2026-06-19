import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // base relativo: necesario para que los assets carguen en GitHub Pages
  base: "./",
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy de /api hacia el backend para evitar problemas de CORS en desarrollo
    proxy: { "/api": "http://localhost:4000" }
  }
});
