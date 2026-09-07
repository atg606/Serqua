import { SHOPIFY_STORE_URL } from "../shopify-config.js";

window.location.replace(`${SHOPIFY_STORE_URL}/account`);

const tabs = [...document.querySelectorAll("[data-dashboard-tab]")];
const panels = [...document.querySelectorAll("[data-dashboard-panel]")];

function showDashboardPanel(name, updateHash = true) {
  tabs.forEach((tab) => {
    const active = tab.dataset.dashboardTab === name;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  panels.forEach((panel) => { panel.hidden = panel.dataset.dashboardPanel !== name; });
  if (updateHash) history.replaceState(null, "", `#${name}`);
  document.querySelector("#dashboard-content").scrollIntoView({ behavior: "smooth", block: "start" });
}

tabs.forEach((tab) => tab.addEventListener("click", () => showDashboardPanel(tab.dataset.dashboardTab)));
document.querySelectorAll("[data-dashboard-jump]").forEach((button) => button.addEventListener("click", () => showDashboardPanel(button.dataset.dashboardJump)));

const initialPanel = location.hash.slice(1);
showDashboardPanel(panels.some((panel) => panel.dataset.dashboardPanel === initialPanel) ? initialPanel : "overview", false);
