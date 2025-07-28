import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
<<<<<<< HEAD
=======
  base: "./",
>>>>>>> 98b57eed39e3d3429fccef08d981f4ffc30fa35b
  build: {
    outDir: "dist",
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    componentTagger(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
<<<<<<< HEAD
=======

>>>>>>> 98b57eed39e3d3429fccef08d981f4ffc30fa35b
