import officialProllegen1kgImage from "../assets/official-prollegen-1kg.png";
import officialProllegen500gImage from "../assets/official-prollegen-500g.png";
import { getShopifyCartUrl } from "../shopify-config.js";

const products = {
  "PROL-1000": { id: "PROL-1000", name: "Prollegen™ 1kg", size: "1KG", servings: "33 servings", price: 4499, mrp: 5499, image: officialProllegen1kgImage },
  "PROL-500": { id: "PROL-500", name: "Prollegen™ 500g", size: "500G", servings: "16 servings", price: 2999, mrp: 3499, image: officialProllegen500gImage },
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const quickDialog = document.querySelector("#quick-view");
const cartDialog = document.querySelector("#cart-drawer");
const cartItems = document.querySelector("[data-cart-items]");
const toast = document.querySelector(".toast");
let quickProduct = products["PROL-1000"];
let quickQuantity = 1;
let cart = loadCart();

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("serqua-cart")) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("serqua-cart", JSON.stringify(cart));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeDialog(dialog) {
  dialog.close();
  if (!quickDialog.open && !cartDialog.open) document.body.classList.remove("dialog-open");
}

function addToCart(product, quantity = 1) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity += quantity;
  else cart.push({ ...product, quantity });
  saveCart();
  renderCart();
  showToast(`${product.name} added to your bag`);
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelectorAll(".cart-count, .mobile-cart-count").forEach((node) => { node.textContent = count; });
  document.querySelector(".cart-button").setAttribute("aria-label", `Open cart, ${count} ${count === 1 ? "item" : "items"}`);
  document.querySelector("[data-cart-heading]").textContent = `(${count})`;
  document.querySelector("[data-subtotal]").textContent = money.format(subtotal);

  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your bag is ready for a better ritual.</p>';
  } else {
    cartItems.innerHTML = cart.map((item) => `
      <article class="cart-item">
        <div class="cart-item-art" aria-hidden="true"><span>${item.size}</span></div>
        <div class="cart-item-copy">
          <p>Prollegen™</p>
          <h3>${item.name}</h3>
          <div class="cart-item-actions">
            <div class="quantity" aria-label="Quantity for ${item.name}">
              <button type="button" data-cart-minus="${item.id}" aria-label="Decrease quantity">−</button>
              <output>${item.quantity}</output>
              <button type="button" data-cart-plus="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-item" type="button" data-cart-remove="${item.id}">Remove</button>
          </div>
        </div>
        <strong>${money.format(item.price * item.quantity)}</strong>
      </article>
    `).join("");
  }

  const remaining = Math.max(4499 - subtotal, 0);
  document.querySelector("[data-shipping-message]").textContent = remaining
    ? `Add ${money.format(remaining)} for free shipping`
    : "You’ve unlocked free shipping";
  document.querySelector("[data-shipping-bar]").style.width = `${Math.min((subtotal / 4499) * 100, 100)}%`;
  document.querySelector("[data-checkout]").disabled = !cart.length;
}

function updateQuickView(product) {
  quickProduct = product;
  quickQuantity = 1;
  document.querySelector("[data-quick-title]").textContent = product.name;
  document.querySelector("[data-quick-image]").src = product.image;
  document.querySelector("[data-quick-selling]").textContent = money.format(product.price);
  document.querySelector("[data-quick-mrp]").textContent = money.format(product.mrp);
  document.querySelector("[data-quick-sku]").textContent = product.id;
  document.querySelector("[data-quick-servings]").textContent = product.servings;
  renderQuickQuantity();
}

function renderQuickQuantity() {
  document.querySelector("[data-qty]").textContent = quickQuantity;
  document.querySelector("[data-quick-price]").textContent = money.format(quickProduct.price * quickQuantity);
}

document.querySelectorAll("[data-open-product]").forEach((button) => {
  button.addEventListener("click", () => {
    updateQuickView(products[button.dataset.product]);
    openDialog(quickDialog);
  });
});

document.querySelectorAll(".add-to-bag").forEach((button) => {
  button.addEventListener("click", () => {
    addToCart(products[button.dataset.product]);
    openDialog(cartDialog);
  });
});

document.querySelector("[data-qty-minus]").addEventListener("click", () => {
  quickQuantity = Math.max(1, quickQuantity - 1);
  renderQuickQuantity();
});

document.querySelector("[data-qty-plus]").addEventListener("click", () => {
  quickQuantity = Math.min(10, quickQuantity + 1);
  renderQuickQuantity();
});

document.querySelector("[data-quick-add]").addEventListener("click", () => {
  addToCart(quickProduct, quickQuantity);
  closeDialog(quickDialog);
  openDialog(cartDialog);
});

document.querySelector("[data-cart-items]").addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  const id = target.dataset.cartPlus || target.dataset.cartMinus || target.dataset.cartRemove;
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  if (target.dataset.cartPlus) item.quantity += 1;
  if (target.dataset.cartMinus) item.quantity -= 1;
  if (target.dataset.cartRemove || item.quantity <= 0) cart = cart.filter((entry) => entry.id !== id);
  saveCart();
  renderCart();
});

document.querySelectorAll(".cart-button, [data-open-cart]").forEach((button) => {
  button.addEventListener("click", () => openDialog(cartDialog));
});
document.querySelector("[data-close-cart]").addEventListener("click", () => closeDialog(cartDialog));
document.querySelector("[data-close-quick]").addEventListener("click", () => closeDialog(quickDialog));

[quickDialog, cartDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
  dialog.addEventListener("close", () => {
    if (!quickDialog.open && !cartDialog.open) document.body.classList.remove("dialog-open");
  });
});

document.querySelector("[data-sort]").addEventListener("change", (event) => {
  const grid = document.querySelector("[data-product-grid]");
  const cards = [...grid.querySelectorAll(".shop-card")];
  const direction = event.target.value;
  cards.sort((a, b) => {
    if (direction === "price-asc") return Number(a.dataset.price) - Number(b.dataset.price);
    if (direction === "price-desc") return Number(b.dataset.price) - Number(a.dataset.price);
    if (direction === "size-desc") return Number(b.dataset.size) - Number(a.dataset.size);
    return Number(b.dataset.featured) - Number(a.dataset.featured);
  });
  cards.forEach((card) => grid.append(card));
});

const categoryLabels = {
  all: "Prollegen collection",
  prollegen: "Prollegen collection",
  1000: "One kilogram",
  500: "Five hundred grams",
};

document.querySelectorAll(".category-nav [data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    let visibleCount = 0;
    document.querySelectorAll(".category-nav [data-category]").forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    document.querySelectorAll(".shop-card").forEach((card) => {
      const visible = category === "all" || card.dataset.category === category || card.dataset.size === category;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    document.querySelector("[data-collection-heading]").textContent = categoryLabels[category];
    document.querySelector("[data-filter-summary]").textContent = `${visibleCount} ${visibleCount === 1 ? "product" : "products"}`;
    document.querySelector("[data-filter-empty]").hidden = visibleCount > 0;
  });
});

const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-nav");
menuButton.addEventListener("click", () => {
  const isOpen = mobileMenu.hidden;
  mobileMenu.hidden = !isOpen;
  menuButton.setAttribute("aria-expanded", String(isOpen));
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("menu-open", isOpen);
});

document.querySelector("[data-checkout]").addEventListener("click", () => {
  const checkoutUrl = getShopifyCartUrl(cart);
  if (!checkoutUrl) {
    showToast("Your bag is empty.");
    return;
  }
  window.location.assign(checkoutUrl);
});

renderCart();

if (new URLSearchParams(window.location.search).get("cart") === "open") {
  openDialog(cartDialog);
}
