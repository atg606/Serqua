const supportForm = document.querySelector("[data-support-form]");
const trackingForm = document.querySelector("[data-tracking-form]");

supportForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!supportForm.reportValidity()) return;
  const status = supportForm.querySelector(".form-status");
  status.textContent = "Your request is valid. Submission will activate when Shopify customer support is connected. For help now, contact us by WhatsApp or email.";
  status.classList.add("is-visible");
});

trackingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!trackingForm.reportValidity()) return;
  trackingForm.querySelector("p").textContent = "Order tracking will activate after Shopify is connected.";
});

if (["#shipping", "#returns"].includes(location.hash)) {
  const target = document.querySelector(location.hash);
  if (target) target.open = true;
}
