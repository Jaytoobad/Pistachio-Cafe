/* =========================================================
   CHECKOUT & ORDER TRACKING
   -----------------------------------------------------------
   PAYSTACK SETUP — read this first:
   1. Create a free account at https://paystack.com and grab
      your PUBLIC key from Settings > API Keys & Webhooks.
      NEVER put your SECRET key in front-end code.
   2. Paste your public key into PAYSTACK_PUBLIC_KEY below.
   3. This demo confirms "payment" purely in the browser once
      Paystack's popup reports success. For a real store you
      MUST verify the transaction on your SERVER using your
      secret key (Paystack's /transaction/verify endpoint)
      before you treat an order as paid — a browser can be
      spoofed, a server-side check can't. A common approach:
      your server listens for Paystack's webhook, verifies the
      signature, marks the order paid, and only then is the
      order visible in your kitchen/admin system.
   4. Order tracking below is a front-end SIMULATION for demo
      purposes (it advances on a timer). Real tracking needs
      your kitchen/staff to update order status in a backend,
      which this page would then poll or subscribe to.
   ========================================================= */

const PAYSTACK_PUBLIC_KEY = "pk_test_replace_with_your_public_key";
const ORDERS_KEY = "pistachio_orders";

document.addEventListener("DOMContentLoaded", () => {
  renderOrderSummary();
  initFulfilmentToggle();
  initPaymentForm();
  initOrderLookup();
});

function renderOrderSummary(){
  const wrap = document.querySelector("[data-checkout-summary]");
  if (!wrap) return;
  const items = getCartDetailed();

  if (items.length === 0){
    wrap.innerHTML = `<p>Your cart is empty. <a href="shop.html">Browse the menu</a> to add something delicious first.</p>`;
    document.querySelector("[data-pay-btn]")?.setAttribute("disabled", "true");
    return;
  }

  const subtotal = getCartSubtotal();
  const total = subtotal + DELIVERY_FEE;

  wrap.innerHTML = items.map(i => `
    <div class="order-line">
      <span>${i.qty} × ${i.name}</span>
      <span>${formatMoney(i.price * i.qty)}</span>
    </div>
  `).join("") + `
    <div class="order-line"><span>Delivery / service fee</span><span>${formatMoney(DELIVERY_FEE)}</span></div>
    <div class="order-line" style="font-weight:700;border-top:1px solid var(--line);padding-top:0.75rem;margin-top:0.5rem;">
      <span>Total due</span><span data-checkout-total>${formatMoney(total)}</span>
    </div>
  `;
}

function initFulfilmentToggle(){
  const buttons = document.querySelectorAll("[data-fulfil]");
  const addressRow = document.querySelector("[data-address-row]");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      if (addressRow) addressRow.style.display = btn.dataset.fulfil === "delivery" ? "block" : "none";
    });
  });
}

function initPaymentForm(){
  const form = document.querySelector("[data-checkout-form]");
  const payBtn = document.querySelector("[data-pay-btn]");
  if (!form || !payBtn) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (getCartDetailed().length === 0){
      showToast("Your cart is empty");
      return;
    }

    const name = form.querySelector("[name='fullname']").value.trim();
    const email = form.querySelector("[name='email']").value.trim();
    const phone = form.querySelector("[name='phone']").value.trim();

    if (!name || !email || !phone){
      showToast("Please fill in your name, email, and phone");
      return;
    }

    const subtotal = getCartSubtotal();
    const totalCedis = subtotal + DELIVERY_FEE;

    // If a real Paystack key has been set, launch the real popup.
    if (typeof PaystackPop !== "undefined" && !PAYSTACK_PUBLIC_KEY.includes("replace_with_your_public_key")){
      const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: Math.round(totalCedis * 100), // Paystack expects the smallest currency unit
        currency: "GHS",
        metadata: { custom_fields: [{ display_name: "Customer name", variable_name: "customer_name", value: name }] },
        callback: function(response){
          completeOrder(name, email, phone);
        },
        onClose: function(){
          showToast("Payment cancelled");
        }
      });
      handler.openIframe();
    } else {
      // DEMO MODE: no live Paystack key configured yet, so we
      // simulate a successful payment so you can see the full
      // order-tracking flow. Replace PAYSTACK_PUBLIC_KEY above
      // to go live.
      payBtn.disabled = true;
      payBtn.textContent = "Processing payment…";
      setTimeout(() => {
        completeOrder(name, email, phone);
      }, 1400);
    }
  });
}

function completeOrder(name, email, phone){
  const orderId = "PI" + Math.floor(100000 + Math.random() * 900000);
  const order = {
    id: orderId,
    name, email, phone,
    items: getCartDetailed(),
    total: getCartSubtotal() + DELIVERY_FEE,
    placedAt: Date.now(),
    status: 0 // index into ORDER_STEPS
  };

  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "{}");
  orders[orderId] = order;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  clearCart();
  document.querySelector("[data-checkout-form-wrap]").style.display = "none";
  showTracker(orderId);
  simulateProgress(orderId);
}

const ORDER_STEPS = ["Received", "Preparing", "Ready", "Completed"];

function showTracker(orderId){
  const tracker = document.querySelector("[data-tracker]");
  if (!tracker) return;
  tracker.classList.add("is-active");
  tracker.querySelector("[data-order-id]").textContent = orderId;
  renderSteps(orderId);
}

function renderSteps(orderId){
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "{}");
  const order = orders[orderId];
  const stepsEl = document.querySelector("[data-steps]");
  if (!order || !stepsEl) return;

  stepsEl.innerHTML = ORDER_STEPS.map((label, i) => `
    <div class="step ${i < order.status ? "is-done" : i === order.status ? "is-current" : ""}">
      <div class="step-dot">${i < order.status ? "✓" : i + 1}</div>
      <div class="step-label">${label}</div>
    </div>
  `).join("");
}

function simulateProgress(orderId){
  // Demo only: advances the order every few seconds so you can
  // see the full tracker. A real system would update `status`
  // from your kitchen/staff dashboard or POS instead.
  const interval = setInterval(() => {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "{}");
    const order = orders[orderId];
    if (!order || order.status >= ORDER_STEPS.length - 1){
      clearInterval(interval);
      return;
    }
    order.status += 1;
    orders[orderId] = order;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    renderSteps(orderId);
  }, 4000);
}

function initOrderLookup(){
  const form = document.querySelector("[data-lookup-form]");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = form.querySelector("input").value.trim().toUpperCase();
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "{}");
    if (orders[id]){
      document.querySelector("[data-checkout-form-wrap]").style.display = "none";
      showTracker(id);
    } else {
      showToast("No order found with that ID on this device");
    }
  });
}
