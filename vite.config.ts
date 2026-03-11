import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.**"],
    },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
  },
});

  

