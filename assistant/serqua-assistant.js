import "./serqua-assistant.css";
import { SHOPIFY_STORE_URL } from "../shopify-config.js";
import {
  beginCustomerLogin,
  customerAccountStatus,
  CustomerAccountError,
  fetchCustomerOrders,
} from "./customer-account-api.js";

const supportLinks = [
  { label: "WhatsApp support", href: "https://wa.me/918792917772", primary: true },
  { label: "Email us", href: "mailto:carol.serqua@gmail.com" },
];

const orderLinks = [
  { label: "View my orders", href: `${SHOPIFY_STORE_URL}/account`, primary: true },
  { label: "Get support", href: "/help/#track-order" },
];

const knowledge = [
  {
    terms: ["track", "tracking", "where order", "order status", "my order", "delivery status", "shipment"],
    kind: "orders",
    text: "I'll securely check your latest Shopify orders now.",
  },
  {
    terms: ["price", "cost", "mrp", "offer", "discount", "how much"],
    text: "Current launch pricing:\n• Prollagen 1kg — ₹5,499 (MRP ₹6,499)\n• Prollagen 500g — ₹2,999 (MRP ₹3,499)",
    links: [{ label: "Shop Prollagen", href: "/shop/", primary: true }],
  },
  {
    terms: ["compare", "size", "1kg", "1 kg", "500g", "500 g", "serving", "which one"],
    text: "Choose 1kg for about 33 servings and the best value, or 500g for about 16 servings and a lower first purchase. The formula and flavour are the same in both sizes.",
    links: [{ label: "Compare in shop", href: "/shop/", primary: true }],
  },
  {
    terms: ["ingredient", "inside", "made of", "formula", "collagen", "protein", "vitamin", "msm", "digestion", "digezyme"],
    text: "Prollagen combines whey protein isolate, Type I & III marine collagen, Vitamin C and MSM, with DigeZyme® digestive enzymes. It is designed to support strength, recovery, skin and connective tissue.",
    links: [{ label: "Explore the formula", href: "/catalog/", primary: true }],
  },
  {
    terms: ["flavour", "flavor", "taste", "vanilla"],
    text: "The current Prollagen edition is Bourbon Vanilla—a balanced vanilla profile designed for an everyday shake ritual.",
  },
  {
    terms: ["shipping", "delivery", "how long", "arrive", "free shipping"],
    text: "Shipping is free on orders of ₹4,499 and above. Most serviceable Indian locations should receive orders in approximately 3–7 business days after dispatch. Final timing appears at checkout.",
    links: [{ label: "Shipping help", href: "/help/#shipping" }],
  },
  {
    terms: ["cod", "cash on delivery", "pay on delivery", "payment"],
    text: "Cash on delivery is available for eligible orders and serviceable PIN codes. Shopify will confirm COD availability during checkout. Online payment options are also shown there.",
    links: [{ label: "Start shopping", href: "/shop/", primary: true }],
  },
  {
    terms: ["return", "refund", "cancel", "damaged", "wrong item"],
    text: "Please contact Serqua support before returning a product. Include your order number and, for damage or a wrong item, clear photos so the team can review it quickly.",
    links: supportLinks,
  },
  {
    terms: ["serqua", "brand", "who are you", "about"],
    text: "Serqua is an Indian performance + beauty nutrition brand. Prollagen brings protein and collagen together in one daily formula—built around the idea that strength and radiance belong in the same ritual.",
    links: [{ label: "Discover Serqua", href: "/catalog/", primary: true }],
  },
  {
    terms: ["how to use", "take", "dosage", "scoop", "when should", "mix"],
    text: "Use Prollagen according to the serving directions printed on your pack. You can mix it into water or milk as part of your daily nutrition routine. If you are pregnant, nursing, have a medical condition or take medication, ask a qualified clinician first.",
  },
  {
    terms: ["contact", "support", "human", "person", "help me", "talk to"],
    text: "The Serqua customer care team can help with orders, delivery, returns or product questions.",
    links: supportLinks,
  },
  {
    terms: ["account", "login", "log in", "sign in", "signup", "sign up", "address"],
    text: "Your customer account is securely managed by Shopify. Sign in to see orders, tracking and saved addresses without sharing private information in this chat.",
    links: orderLinks,
  },
];

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9₹+ ]/g, " ").replace(/\s+/g, " ").trim();

function answerFor(question) {
  const query = normalize(question);
  if (/^(hi|hello|hey|hii|namaste)\b/.test(query)) {
    return { text: "Hi—I'm Serqua Assist. Ask me about Prollagen, ingredients, prices, delivery, returns or your order." };
  }
  if (/\b(thank|thanks|thx)\b/.test(query)) {
    return { text: "You're welcome. Ask me anything else about Serqua or your order." };
  }

  let best = null;
  let bestScore = 0;
  knowledge.forEach((entry) => {
    const score = entry.terms.reduce((total, term) => total + (query.includes(term) ? Math.max(1, term.split(" ").length) : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });

  return best || {
    text: "I couldn't match that confidently yet. I can help with Prollagen, prices, ingredients, serving sizes, shipping, COD, returns and secure order tracking—or connect you with the Serqua team.",
    links: supportLinks,
  };
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

const launcher = document.createElement("button");
launcher.type = "button";
launcher.className = "serqua-assistant-launcher";
launcher.setAttribute("aria-haspopup", "dialog");
launcher.setAttribute("aria-label", "Open Serqua assistant");
launcher.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 5.5h14v10H9l-4 3v-13Z" stroke="currentColor" stroke-width="1.7"/><path d="M8 9h8M8 12h5" stroke="currentColor" stroke-width="1.7"/></svg><span>Ask Serqua</span>';

const dialog = document.createElement("dialog");
dialog.className = "serqua-assistant-dialog";
dialog.setAttribute("aria-label", "Serqua product and order assistant");
dialog.innerHTML = `
  <header class="serqua-assistant-header">
    <div class="serqua-assistant-brand"><span class="serqua-assistant-mark" aria-hidden="true">S</span><div><strong>Serqua Assist</strong><small>Products · orders · support</small></div></div>
    <button class="serqua-assistant-close" type="button" aria-label="Close assistant">×</button>
  </header>
  <div class="serqua-assistant-messages" role="log" aria-live="polite" aria-relevant="additions"></div>
  <div class="serqua-assistant-suggestions" aria-label="Suggested questions"></div>
  <div>
    <form class="serqua-assistant-form">
      <label for="serqua-assistant-input" class="visually-hidden">Ask Serqua a question</label>
      <input id="serqua-assistant-input" name="question" type="text" autocomplete="off" maxlength="240" placeholder="Ask in your own words…" required>
      <button type="submit">Send</button>
    </form>
    <p class="serqua-assistant-note">Product guidance only—not medical advice. Private order details stay inside Shopify.</p>
  </div>`;

document.body.append(launcher, dialog);

const messages = dialog.querySelector(".serqua-assistant-messages");
const suggestions = dialog.querySelector(".serqua-assistant-suggestions");
const form = dialog.querySelector("form");
const input = dialog.querySelector("input");
const sendButton = form.querySelector("button");
const closeButton = dialog.querySelector(".serqua-assistant-close");

function addMessage(role, response) {
  const message = makeElement("div", "serqua-assistant-message");
  message.dataset.role = role;
  message.append(makeElement("p", "", response.text));
  if (response.links?.length) {
    const actions = makeElement("div", "serqua-assistant-message-actions");
    response.links.forEach((link) => {
      const anchor = makeElement("a", "", link.label);
      anchor.href = link.href;
      if (link.primary) anchor.dataset.primary = "true";
      if (link.href.startsWith("http")) {
        anchor.target = "_blank";
        anchor.rel = "noreferrer";
      }
      actions.append(anchor);
    });
    message.append(actions);
  }
  if (response.actions?.length) {
    const actions = message.querySelector(".serqua-assistant-message-actions") || makeElement("div", "serqua-assistant-message-actions");
    response.actions.forEach((action) => {
      const button = makeElement("button", "", action.label);
      button.type = "button";
      if (action.primary) button.dataset.primary = "true";
      button.addEventListener("click", action.onClick);
      actions.append(button);
    });
    if (!actions.parentElement) message.append(actions);
  }
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
}

function humanizeStatus(value) {
  if (!value) return "Not available";
  return value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMoney(money) {
  if (!money?.amount) return "";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: money.currencyCode || "INR", maximumFractionDigits: 2 }).format(Number(money.amount));
  } catch {
    return `${money.currencyCode || "INR"} ${money.amount}`;
  }
}

function addOrders(orders) {
  const wrapper = makeElement("div", "serqua-assistant-orders");
  const introduction = makeElement("div", "serqua-assistant-message");
  introduction.dataset.role = "assistant";
  introduction.append(makeElement("p", "", orders.length
    ? `I found ${orders.length} recent ${orders.length === 1 ? "order" : "orders"} in your Shopify account.`
    : "You're signed in, but there are no orders in this customer account yet."));
  wrapper.append(introduction);

  orders.forEach((order) => {
    const card = makeElement("article", "serqua-assistant-order");
    const header = makeElement("header", "serqua-assistant-order-header");
    const titleWrap = makeElement("div");
    titleWrap.append(makeElement("strong", "", order.name || "Order"));
    const date = order.processedAt ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(order.processedAt)) : "Date unavailable";
    titleWrap.append(makeElement("small", "", date));
    header.append(titleWrap, makeElement("b", "", formatMoney(order.totalPrice)));
    card.append(header);

    const statuses = makeElement("div", "serqua-assistant-order-statuses");
    statuses.append(makeElement("span", "", humanizeStatus(order.fulfillmentStatus)));
    statuses.append(makeElement("span", "", humanizeStatus(order.financialStatus)));
    card.append(statuses);

    const items = makeElement("ul", "serqua-assistant-order-items");
    (order.lineItems?.nodes || []).forEach((item) => {
      const variant = item.variantTitle && item.variantTitle !== "Default Title" ? ` · ${item.variantTitle}` : "";
      items.append(makeElement("li", "", `${item.quantity} × ${item.title}${variant}`));
    });
    if (items.childElementCount) card.append(items);

    const tracking = (order.fulfillments?.nodes || []).flatMap((fulfillment) => fulfillment.trackingInformation || []);
    if (tracking.length) {
      const trackWrap = makeElement("div", "serqua-assistant-order-tracking");
      tracking.forEach((shipment, index) => {
        const label = shipment.company
          ? `${shipment.company}${shipment.number ? ` · ${shipment.number}` : ""}`
          : shipment.number || `Track shipment ${index + 1}`;
        if (shipment.url) {
          const link = makeElement("a", "", label);
          link.href = shipment.url;
          link.target = "_blank";
          link.rel = "noreferrer";
          trackWrap.append(link);
        } else {
          trackWrap.append(makeElement("span", "", label));
        }
      });
      card.append(trackWrap);
    } else {
      card.append(makeElement("p", "serqua-assistant-order-note", "Tracking will appear here after dispatch."));
    }
    wrapper.append(card);
  });

  messages.append(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

async function startCustomerLogin() {
  try {
    await beginCustomerLogin(window.location.href);
  } catch (error) {
    addMessage("assistant", {
      text: error?.message || "Shopify sign-in could not be started. Please try again or contact Serqua support.",
      links: supportLinks,
    });
  }
}

async function showCustomerOrders() {
  const accountStatus = customerAccountStatus();
  if (accountStatus === "setup-required") {
    addMessage("assistant", {
      text: "Direct order lookup is built, but the Shopify Customer Account connection still needs its public client ID. Until that one-time setup is completed, you can view the same details securely in Shopify.",
      links: orderLinks,
    });
    return;
  }
  if (accountStatus === "https-required") {
    addMessage("assistant", {
      text: "Shopify protects customer data by allowing sign-in only on HTTPS. Use a secure preview or the live Serqua domain to test direct order lookup.",
      links: orderLinks,
    });
    return;
  }
  if (accountStatus === "signed-out") {
    addMessage("assistant", {
      text: "Sign in once with Shopify, then you'll return here and I’ll show your latest orders and tracking details directly in this chat.",
      actions: [{
        label: "Sign in & show orders",
        primary: true,
        onClick: startCustomerLogin,
      }],
    });
    return;
  }

  try {
    const orders = await fetchCustomerOrders();
    addOrders(orders);
  } catch (error) {
    if (error instanceof CustomerAccountError && error.code === "AUTH_REQUIRED") {
      addMessage("assistant", {
        text: "Your secure session has ended. Sign in again and I’ll bring your orders back into this chat.",
        actions: [{ label: "Sign in again", primary: true, onClick: startCustomerLogin }],
      });
      return;
    }
    addMessage("assistant", {
      text: "I couldn't load your Shopify orders right now. Your information is safe—please try again or contact Serqua support.",
      links: supportLinks,
    });
  }
}

function showTyping() {
  const message = makeElement("div", "serqua-assistant-message");
  message.dataset.role = "assistant";
  message.dataset.typing = "true";
  message.setAttribute("aria-label", "Serqua Assist is typing");
  message.innerHTML = '<span class="serqua-assistant-typing" aria-hidden="true"><i></i><i></i><i></i></span>';
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

async function ask(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  addMessage("user", { text: cleanQuestion });
  input.value = "";
  input.disabled = true;
  sendButton.disabled = true;
  const typing = showTyping();
  await new Promise((resolve) => window.setTimeout(resolve, 360));
  typing.remove();
  const response = answerFor(cleanQuestion);
  if (response.kind === "orders") await showCustomerOrders();
  else addMessage("assistant", response);
  input.disabled = false;
  sendButton.disabled = false;
  input.focus();
}

["Track my order", "Compare sizes", "What's inside?", "Shipping & COD"].forEach((question) => {
  const button = makeElement("button", "serqua-assistant-suggestion", question);
  button.type = "button";
  button.addEventListener("click", () => ask(question));
  suggestions.append(button);
});

launcher.addEventListener("click", () => {
  dialog.showModal();
  launcher.hidden = true;
  window.setTimeout(() => input.focus(), 0);
});

function closeAssistant() {
  dialog.close();
  launcher.hidden = false;
  launcher.focus();
}

closeButton.addEventListener("click", closeAssistant);
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeAssistant();
});
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) closeAssistant();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  ask(input.value);
});

addMessage("assistant", {
  text: "Hi—I'm Serqua Assist. Ask me a question in simple English about Prollagen, Serqua, delivery or your order.",
});

const launchParameters = new URLSearchParams(window.location.search);
if (launchParameters.get("serqua_assistant") === "orders") {
  launchParameters.delete("serqua_assistant");
  const cleanUrl = `${window.location.pathname}${launchParameters.size ? `?${launchParameters}` : ""}${window.location.hash}`;
  history.replaceState(null, "", cleanUrl);
  dialog.showModal();
  launcher.hidden = true;
  addMessage("user", { text: "Show my orders" });
  showCustomerOrders();
}
