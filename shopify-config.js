export const SHOPIFY_STORE_URL = "https://jmkeq0-bd.myshopify.com";

export const SHOPIFY_VARIANT_IDS = {
  "PROL-1000": "54664027799827",
  "PROL-500": "54664028913939",
};

export function getShopifyAccountUrl(mode = "login") {
  const path = mode === "signup" ? "/account/register" : "/account/login";
  return `${SHOPIFY_STORE_URL}${path}`;
}

export function getShopifyCartUrl(items) {
  const lines = items
    .map((item) => {
      const variantId = SHOPIFY_VARIANT_IDS[item.id];
      const quantity = Math.max(1, Number(item.quantity) || 1);
      return variantId ? `${variantId}:${quantity}` : null;
    })
    .filter(Boolean);

  return lines.length ? `${SHOPIFY_STORE_URL}/cart/${lines.join(",")}?checkout` : null;
}
