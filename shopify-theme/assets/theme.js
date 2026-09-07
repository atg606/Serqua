const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');

if (menuButton && mobileNav) {
  const setMenu = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    mobileNav.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  };

  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  mobileNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
}

document.querySelectorAll('[data-auto-submit]').forEach((select) => {
  select.addEventListener('change', () => select.form.submit());
});

const quickDialog = document.querySelector('#quick-view');

if (quickDialog) {
  const quickImage = quickDialog.querySelector('[data-quick-image]');
  const quickTitle = quickDialog.querySelector('[data-quick-title]');
  const quickPrice = quickDialog.querySelector('[data-quick-price]');
  const quickCompare = quickDialog.querySelector('[data-quick-compare]');
  const quickSku = quickDialog.querySelector('[data-quick-sku]');
  const quickVariant = quickDialog.querySelector('[data-quick-variant]');
  const quickLink = quickDialog.querySelector('[data-quick-link]');
  const quickAdd = quickDialog.querySelector('.quick-add');

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-quick-view]');
    if (!trigger) return;

    quickImage.src = trigger.dataset.productImage;
    quickImage.alt = trigger.dataset.productImageAlt;
    quickTitle.textContent = trigger.dataset.productTitle;
    quickPrice.textContent = trigger.dataset.productPrice;
    quickCompare.textContent = trigger.dataset.productComparePrice;
    quickCompare.hidden = !trigger.dataset.productComparePrice;
    quickSku.textContent = trigger.dataset.productSku;
    quickVariant.value = trigger.dataset.productVariant;
    quickLink.href = trigger.dataset.productUrl;
    quickAdd.disabled = trigger.dataset.productAvailable !== 'true';
    quickDialog.querySelector('[name="quantity"]').value = '1';
    quickDialog.showModal();
    document.body.classList.add('dialog-open');
  });

  quickDialog.querySelector('[data-close-quick]').addEventListener('click', () => quickDialog.close());
  quickDialog.addEventListener('click', (event) => {
    if (event.target === quickDialog) quickDialog.close();
  });
  quickDialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
}
