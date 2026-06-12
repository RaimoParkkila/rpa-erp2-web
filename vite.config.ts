import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@domains": path.resolve(__dirname, "./src/domains"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils")
    }
  },

  // IMPORTANT: only for local dev (NOT Vercel build)
  server: {
    proxy: {
      "/api": "http://localhost:3000"
    }
  },

  // 🔥 FIX: prevents lightningcss/minify crash on Vercel
  build: {
    cssMinify: false
  }
});