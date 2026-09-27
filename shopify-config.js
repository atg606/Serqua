export const SHOPIFY_STORE_URL = "https://jmkeq0-bd.myshopify.com";
export const SHOPIFY_STOREFRONT_DOMAIN = "serqua.in";

// Public Customer Account API credentials. The client ID is intentionally read
// from Vite's public environment; never place a Shopify client secret here.
export const SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID =
  import.meta.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || "";

export const SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI =
  import.meta.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI ||
  "https://serqua.in/customer-auth/callback/";

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
