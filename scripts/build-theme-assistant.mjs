import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

await build({
  entryPoints: ['assistant/serqua-assistant.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  outfile: 'shopify-theme/assets/serqua-assistant.js',
  define: { 'import.meta.env': '{}' },
  plugins: [{
    name: 'shopify-storefront-routes',
    setup(builder) {
      builder.onLoad({ filter: /serqua-assistant\.js$/ }, async ({ path }) => ({
        contents: (await readFile(path, 'utf8'))
          .replaceAll('/shop/', '/collections/all')
          .replaceAll('/catalog/', '/pages/catalog')
          .replaceAll('/help/', '/pages/help')
          .replace('Direct order lookup is built, but the Shopify Customer Account connection still needs its public client ID. Until that one-time setup is completed, you can view the same details securely in Shopify.', 'You can view your latest orders and tracking details securely in your Serqua account. For help with an order, contact our support team.'),
        loader: 'js',
      }));
    },
  }],
});
