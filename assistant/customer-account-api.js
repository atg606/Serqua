import {
  SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
  SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI,
  SHOPIFY_STOREFRONT_DOMAIN,
} from "../shopify-config.js";

const AUTH_DISCOVERY_URL = `https://${SHOPIFY_STOREFRONT_DOMAIN}/.well-known/openid-configuration`;
const API_DISCOVERY_URL = `https://${SHOPIFY_STOREFRONT_DOMAIN}/.well-known/customer-account-api`;
const TOKEN_KEY = "serqua_customer_tokens";
const VERIFIER_KEY = "serqua_customer_code_verifier";
const STATE_KEY = "serqua_customer_auth_state";
const RETURN_KEY = "serqua_customer_return_url";

const CUSTOMER_ORDERS_QUERY = `
  query CustomerOrders {
    customer {
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          fulfillmentStatus
          financialStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 10) {
            nodes {
              title
              quantity
              variantTitle
            }
          }
          fulfillments(first: 10) {
            nodes {
              status
              trackingInformation {
                company
                number
                url
              }
            }
          }
        }
      }
    }
  }
`;

let authDiscovery;
let apiDiscovery;

export class CustomerAccountError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CustomerAccountError";
    this.code = code;
  }
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  let result = null;
  try {
    result = await response.json();
  } catch {
    // The error below includes a safe, customer-facing explanation.
  }
  if (!response.ok) {
    const detail = result?.error_description || result?.error || `Request failed (${response.status})`;
    throw new CustomerAccountError("REQUEST_FAILED", detail);
  }
  return result;
}

async function discoverAuth() {
  authDiscovery ||= fetchJson(AUTH_DISCOVERY_URL);
  return authDiscovery;
}

async function discoverApi() {
  apiDiscovery ||= fetchJson(API_DISCOVERY_URL);
  return apiDiscovery;
}

function randomBase64Url(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function codeChallenge(verifier) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  let binary = "";
  new Uint8Array(digest).forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function readTokens() {
  try {
    return JSON.parse(sessionStorage.getItem(TOKEN_KEY) || "null");
  } catch {
    return null;
  }
}

function saveTokens(tokens) {
  const expiresIn = Math.max(0, Number(tokens.expires_in) || 0);
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || null,
    expiresAt: Date.now() + Math.max(0, expiresIn - 60) * 1000,
  }));
}

async function refreshAccessToken(refreshToken) {
  const config = await discoverAuth();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
    refresh_token: refreshToken,
  });
  const tokens = await fetchJson(config.token_endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  saveTokens(tokens);
  return tokens.access_token;
}

async function accessToken() {
  const tokens = readTokens();
  if (!tokens?.accessToken) return null;
  if (tokens.expiresAt > Date.now()) return tokens.accessToken;
  if (tokens.refreshToken) {
    try {
      return await refreshAccessToken(tokens.refreshToken);
    } catch {
      sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }
  sessionStorage.removeItem(TOKEN_KEY);
  return null;
}

export function customerAccountStatus() {
  if (!SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) return "setup-required";
  const callbackOrigin = new URL(SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI).origin;
  if (window.location.protocol !== "https:" || callbackOrigin !== window.location.origin) return "https-required";
  return readTokens()?.accessToken ? "signed-in" : "signed-out";
}

export async function beginCustomerLogin(returnUrl = window.location.href) {
  if (!SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) {
    throw new CustomerAccountError("SETUP_REQUIRED", "Shopify Customer Account API is not configured yet.");
  }
  const callbackOrigin = new URL(SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI).origin;
  if (window.location.protocol !== "https:" || callbackOrigin !== window.location.origin) {
    throw new CustomerAccountError("HTTPS_REQUIRED", "Shopify sign-in requires an HTTPS page on the same origin as its registered callback.");
  }

  const config = await discoverAuth();
  const verifier = randomBase64Url();
  const state = randomBase64Url(24);
  const nonce = randomBase64Url(24);
  const challenge = await codeChallenge(verifier);
  const authorizationUrl = new URL(config.authorization_endpoint);

  authorizationUrl.searchParams.set("scope", "openid email customer-account-api:full");
  authorizationUrl.searchParams.set("client_id", SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("redirect_uri", SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("nonce", nonce);
  authorizationUrl.searchParams.set("code_challenge", challenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");
  authorizationUrl.searchParams.set("locale", "en");
  authorizationUrl.searchParams.set("region_country", "IN");

  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(RETURN_KEY, returnUrl);
  window.location.assign(authorizationUrl.toString());
}

export async function completeCustomerLogin(callbackUrl = window.location.href) {
  const url = new URL(callbackUrl);
  const error = url.searchParams.get("error");
  if (error) {
    throw new CustomerAccountError(error.toUpperCase(), url.searchParams.get("error_description") || "Shopify sign-in was not completed.");
  }

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const savedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!code || !returnedState || !savedState || !verifier || returnedState !== savedState) {
    throw new CustomerAccountError("INVALID_CALLBACK", "The Shopify sign-in response could not be verified. Please try again.");
  }

  const config = await discoverAuth();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
    redirect_uri: SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI,
    code,
    code_verifier: verifier,
  });
  const tokens = await fetchJson(config.token_endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  saveTokens(tokens);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  const returnUrl = sessionStorage.getItem(RETURN_KEY) || "/";
  sessionStorage.removeItem(RETURN_KEY);
  return returnUrl;
}

export async function fetchCustomerOrders() {
  if (!SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) {
    throw new CustomerAccountError("SETUP_REQUIRED", "Shopify Customer Account API is not configured yet.");
  }
  const token = await accessToken();
  if (!token) throw new CustomerAccountError("AUTH_REQUIRED", "Please sign in securely to view your orders.");

  const config = await discoverApi();
  const result = await fetchJson(config.graphql_api, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ query: CUSTOMER_ORDERS_QUERY }),
  });

  if (result.errors?.length) {
    const unauthenticated = result.errors.some((item) => /access|auth|token/i.test(item.message));
    if (unauthenticated) sessionStorage.removeItem(TOKEN_KEY);
    throw new CustomerAccountError(unauthenticated ? "AUTH_REQUIRED" : "GRAPHQL_ERROR", result.errors[0].message);
  }
  return result.data?.customer?.orders?.nodes || [];
}
