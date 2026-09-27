import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    {
      name: "normalize-directory-routes",
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const directoryRoutes = ["/catalog", "/shop", "/help", "/account", "/terms", "/privacy", "/customer-auth/callback"];
          if (directoryRoutes.includes(request.url)) {
            response.statusCode = 308;
            response.setHeader("Location", `${request.url}/`);
            response.end();
            return;
          }
          next();
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        home: resolve(projectRoot, "index.html"),
        shop: resolve(projectRoot, "shop/index.html"),
        account: resolve(projectRoot, "account/index.html"),
        catalog: resolve(projectRoot, "catalog/index.html"),
        help: resolve(projectRoot, "help/index.html"),
        terms: resolve(projectRoot, "terms/index.html"),
        privacy: resolve(projectRoot, "privacy/index.html"),
        customerAuthCallback: resolve(projectRoot, "customer-auth/callback/index.html"),
      },
    },
  },
});
