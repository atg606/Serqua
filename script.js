const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');
const cartButton = document.querySelector('.cart-button');
const cartCount = document.querySelector('.cart-count');
const toast = document.querySelector('.toast');
const addButtons = document.querySelectorAll('.add-button');
const quickViewButtons = document.querySelectorAll('[data-home-quick-view]');

const homepageProducts = {
  'Prollegen 1kg': { id: 'PROL-1000', name: 'Prollegen™ 1kg', size: '1KG', servings: '33 servings', price: 4499, mrp: 5499 },
  'Prollegen 500g': { id: 'PROL-500', name: 'Prollegen™ 500g', size: '500G', servings: '16 servings', price: 2999, mrp: 3499 },
};

let cart = [];
try {
  cart = JSON.parse(localStorage.getItem('serqua-cart')) || [];
} catch {
  cart = [];
}
let cartItems = cart.reduce((total, item) => total + item.quantity, 0);
let toastTimer;

cartCount.textContent = String(cartItems);
cartButton.setAttribute('aria-label', `Cart, ${cartItems} ${cartItems === 1 ? 'item' : 'items'}`);

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  mobileNav.hidden = !open;
  document.body.classList.toggle('menu-open', open);
}

menuButton.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

mobileNav.addEventListener('click', (event) => {
  if (event.target.matches('a')) setMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

addButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const product = homepageProducts[button.dataset.product];
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem('serqua-cart', JSON.stringify(cart));
    cartItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = String(cartItems);
    cartButton.setAttribute('aria-label', `Cart, ${cartItems} ${cartItems === 1 ? 'item' : 'items'}`);

    const original = button.textContent;
    button.textContent = 'Added';
    button.disabled = true;
    window.setTimeout(() => {
      button.textContent = original;
      button.disabled = false;
    }, 900);

    window.clearTimeout(toastTimer);
    toast.textContent = `${button.dataset.product} added to your cart.`;
    toast.classList.add('show');
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  });
});

cartButton.addEventListener('click', () => {
  window.location.href = '/shop/?cart=open';
});

quickViewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const product = encodeURIComponent(button.dataset.homeQuickView);
    window.location.href = `/shop/?product=${product}`;
  });
});
