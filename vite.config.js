import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true,

    rollupOptions: {
      // Two entry points: the JS bundle and the LESS stylesheet
      input: {
        zrps: path.resolve(__dirname, "src/module/zrps.js"),
        styles: path.resolve(__dirname, "src/styles/zrps.less"),
      },
      output: {
        // JS bundle goes to scripts/
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "styles") return "styles/[name].js";
          return "scripts/[name].js";
        },
        // Keep single-chunk output, no hashing
        chunkFileNames: "scripts/[name].js",
        assetFileNames: (assetInfo) => {
          // Route compiled CSS into styles/
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "styles/zrps.css";
          }
          return "assets/[name][extname]";
        },
      },
    },
  },

  css: {
    // Vite handles Less natively when the `less` package is installed
    preprocessorOptions: {
      less: {},
    },
  },

  plugins: [
    viteStaticCopy({
      targets: [
        // Manifests
        { src: "src/system.json", dest: "." },
        { src: "src/template.json", dest: "." },
        // Handlebars templates
        { src: "src/templates", dest: "." },
        // Localisation
        { src: "src/lang", dest: "." },
      ],
    }),
  ],
});
