import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(projectRoot, "index.html"),
        shop: resolve(projectRoot, "shop/index.html"),
        account: resolve(projectRoot, "account/index.html"),
        help: resolve(projectRoot, "help/index.html"),
        terms: resolve(projectRoot, "terms/index.html"),
        privacy: resolve(projectRoot, "privacy/index.html"),
      },
    },
  },
});
