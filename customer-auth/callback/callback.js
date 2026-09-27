import { completeCustomerLogin } from "../../assistant/customer-account-api.js";

const status = document.querySelector("[data-auth-status]");
const homeLink = document.querySelector("[data-auth-home]");

async function finishSignIn() {
  try {
    const returnUrl = await completeCustomerLogin();
    const target = new URL(returnUrl, window.location.origin);
    target.searchParams.set("serqua_assistant", "orders");
    window.location.replace(target.toString());
  } catch (error) {
    status.textContent = error?.message || "We could not complete Shopify sign-in. Please try again.";
    homeLink.hidden = false;
  }
}

finishSignIn();
