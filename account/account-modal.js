import { getShopifyAccountUrl } from "../shopify-config.js";

const modalMarkup = `
  <dialog class="account-modal" aria-labelledby="account-modal-title">
    <button class="account-modal-close" type="button" aria-label="Close customer account" data-account-close>×</button>
    <section class="account-modal-content">
      <div class="account-tabs" role="tablist" aria-label="Customer access">
        <button id="account-login-tab" type="button" role="tab" aria-selected="true" aria-controls="account-login-panel" data-account-tab="login">Log in</button>
        <button id="account-signup-tab" type="button" role="tab" aria-selected="false" aria-controls="account-signup-panel" data-account-tab="signup">Sign up</button>
      </div>
      <div class="account-view" id="account-login-panel" role="tabpanel" aria-labelledby="account-login-tab" data-account-panel="login">
        <p class="account-kicker">Welcome back</p>
        <h2 id="account-modal-title">Log in.</h2>
        <p class="account-intro">Continue to Shopify’s secure customer account service. You’ll receive a six-digit code by email—no password required.</p>
        <form data-account-form="login">
          <button class="account-submit" type="submit">Continue to secure login <span aria-hidden="true">→</span></button>
          <p class="account-status" role="status" aria-live="polite"></p>
        </form>
        <p class="account-switch">New to Serqua? <button type="button" data-account-switch="signup">Create an account</button></p>
      </div>
      <div class="account-view" id="account-signup-panel" role="tabpanel" aria-labelledby="account-signup-tab" data-account-panel="signup" hidden>
        <p class="account-kicker">Join Serqua</p>
        <h2>Create account.</h2>
        <p class="account-intro">Your account will be created securely by Shopify. Delivery and billing details are collected only when needed.</p>
        <form data-account-form="signup">
          <button class="account-submit" type="submit">Continue to Shopify <span aria-hidden="true">→</span></button>
          <p class="account-status" role="status" aria-live="polite"></p>
        </form>
        <p class="account-switch">By continuing, you agree to the <a href="/terms/">Terms and Conditions</a> and <a href="/privacy/">Privacy Policy</a>.</p>
        <p class="account-switch">Already registered? <button type="button" data-account-switch="login">Log in</button></p>
      </div>
      <p class="account-security">Your sign-in and customer details are securely handled by Shopify. Serqua does not store your password or payment details.</p>
    </section>
  </dialog>`;

document.body.insertAdjacentHTML("beforeend", modalMarkup);

const accountModal = document.querySelector(".account-modal");
const accountTabs = [...accountModal.querySelectorAll("[data-account-tab]")];
const accountPanels = [...accountModal.querySelectorAll("[data-account-panel]")];

function showAccountPanel(name) {
  accountTabs.forEach((tab) => {
    const active = tab.dataset.accountTab === name;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  accountPanels.forEach((panel) => { panel.hidden = panel.dataset.accountPanel !== name; });
}

function openAccountModal() {
  showAccountPanel("login");
  accountModal.showModal();
  document.body.classList.add("account-open");
  window.setTimeout(() => accountModal.querySelector('[data-account-panel="login"] .account-submit').focus(), 0);
}

function closeAccountModal() {
  accountModal.close();
  document.body.classList.remove("account-open");
}

document.querySelectorAll("[data-account-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const mobileNav = document.querySelector(".mobile-nav");
    const menuButton = document.querySelector(".menu-button");
    if (mobileNav && !mobileNav.hidden) {
      mobileNav.hidden = true;
      menuButton?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }
    openAccountModal();
  });
});

accountModal.querySelector("[data-account-close]").addEventListener("click", closeAccountModal);
accountModal.addEventListener("click", (event) => { if (event.target === accountModal) closeAccountModal(); });
accountModal.addEventListener("close", () => document.body.classList.remove("account-open"));

accountTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => showAccountPanel(tab.dataset.accountTab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = accountTabs[(index + direction + accountTabs.length) % accountTabs.length];
    showAccountPanel(next.dataset.accountTab);
    next.focus();
  });
});

accountModal.querySelectorAll("[data-account-switch]").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.accountSwitch;
    showAccountPanel(name);
    accountModal.querySelector(`[data-account-panel="${name}"] .account-submit`).focus();
  });
});

accountModal.querySelectorAll("[data-account-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const status = form.querySelector(".account-status");
    const mode = form.dataset.accountForm;
    status.textContent = mode === "login"
      ? "Opening secure Shopify login…"
      : "Opening secure Shopify account creation…";
    status.classList.add("is-visible");
    window.setTimeout(() => window.location.assign(getShopifyAccountUrl(mode)), 250);
  });
});
