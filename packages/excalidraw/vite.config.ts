import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets'

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    libAssetsPlugin({ /* options */ }),
  ],
  build: {
    assetsInlineLimit: 1024,
    lib: {
      entry: resolve(__dirname, "index.tsx"),
      name: "excalidraw",
      // the proper extensions will be added
      fileName: "excalidraw",
      formats: ["es"],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react", "react-dom"],
    },
  },
});
