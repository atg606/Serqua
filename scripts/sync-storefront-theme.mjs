import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = path => readFileSync(path, 'utf8');
const assetNames = new Set();
const convert = text => text.replace(/(?:\.\.\/|\.\/|\/)assets\/([\w.-]+)/g, (_, name) => {
  assetNames.add(name);
  return `{{ '${name}' | asset_url }}`;
}).replaceAll('href="/shop/"', 'href="{{ routes.all_products_collection_url }}"')
  .replaceAll('href="/catalog/"', 'href="/pages/catalog"')
  .replaceAll('href="/help/', 'href="/pages/help');
const main = text => text.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1].trim();
const section = (text, id) => text.match(new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?<\\/section>`))[0];
const dimensions = text => text.replace(/<img\b[^>]*>/g, tag => {
  if (/\bwidth=/.test(tag) && /\bheight=/.test(tag)) return tag;
  const name = tag.match(/'([\w.-]+)' \| asset_url/)[1];
  const info = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', `assets/${name}`], {encoding:'utf8'});
  return tag.replace(/\s*\/?>(\s*)$/, ` width="${info.match(/pixelWidth: (\d+)/)[1]}" height="${info.match(/pixelHeight: (\d+)/)[1]}" />`);
});

const catalogPath = 'shopify-theme/sections/serqua-catalog.liquid';
const schema = read(catalogPath).match(/{% schema %}[\s\S]*$/)[0];
writeFileSync(catalogPath, dimensions(convert(main(read('catalog/index.html')))) + '\n\n' + schema);
copyFileSync('catalog/catalog.css', 'shopify-theme/assets/magazine.css');
const localJs = read('catalog/catalog.js');
writeFileSync('shopify-theme/assets/magazine.js', localJs.slice(localJs.indexOf('const slider ='), localJs.indexOf('const archive =')));

const homePath = 'shopify-theme/sections/serqua-home.liquid';
let home = read(homePath);
const localHome = read('index.html');
for (const id of ['top', 'world', 'why', 'ingredients', 'social']) {
  home = home.replace(section(home, id), dimensions(convert(section(localHome, id))));
}
writeFileSync(homePath, home);
const cssPath = 'shopify-theme/assets/home.css.liquid';
const marker = '\n/* Synced local storefront styles */\n';
writeFileSync(cssPath, read(cssPath).split(marker)[0] + marker + convert(read('styles.css')) + '\nbody.dialog-open{overflow:hidden}.account-text,.cart-text{display:none}.product-actions form{margin:0}\n');

const collectionPath = 'shopify-theme/sections/serqua-collection.liquid';
let collection = read(collectionPath).replace(/<section class="shop-community"[\s\S]*?<\/section>\s*/, '');
const carousel = read('shop/index.html').match(/<section class="shop-community"[\s\S]*?<\/section>/)[0];
collection = collection.replace('<section class="collection"', dimensions(convert(carousel)) + '\n\n<section class="collection"');
if (!collection.includes("'community.js'")) collection = "{{ 'community.css' | asset_url | stylesheet_tag }}\n<script src=\"{{ 'community.js' | asset_url }}\" defer></script>\n" + collection;
writeFileSync(collectionPath, collection);
const shopJs = read('shop/shop.js');
writeFileSync('shopify-theme/assets/community.js', shopJs.slice(shopJs.indexOf('const communityCarousel ='), shopJs.indexOf('function loadCart()')));
const shopCss = read('shop/shop.css');
const desktop = shopCss.split('\n').filter(line => line.startsWith('.shop-community')).join('\n');
const mobile = shopCss.split('\n').filter(line => line.startsWith('  .shop-community') && !line.includes('transition-duration')).join('\n');
writeFileSync('shopify-theme/assets/community.css', desktop + '\n@media(max-width:650px){\n' + mobile + '\n}\n@media(prefers-reduced-motion:reduce){.shop-community__slide{transition:none;transform:none}}\n');
for (const name of assetNames) {
  if (!existsSync(`assets/${name}`)) throw new Error(`Missing local asset: ${name}`);
  copyFileSync(`assets/${name}`, `shopify-theme/assets/${name}`);
}
console.log(`Synced homepage, magazine and shop slideshow; ${assetNames.size} referenced images copied.`);
