/* =========================================================
   CART PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("[data-cart-list]");
  const emptyState = document.querySelector("[data-cart-empty]");
  const summary = document.querySelector("[data-cart-summary]");
  if (!list) return;

  function render(){
    const items = getCartDetailed();

    if (items.length === 0){
      list.hidden = true;
      summary.hidden = true;
      emptyState.hidden = false;
      return;
    }

    list.hidden = false;
    summary.hidden = false;
    emptyState.hidden = true;

    list.innerHTML = items.map(item => `
      <div class="cart-item" data-item="${item.id}">
        <div class="cart-item-media">
          <img src="${item.image}" alt="" loading="lazy"
               onerror="this.style.display='none'">
        </div>
        <div>
          <p class="cart-item-name mt-0">${item.name}</p>
          <p class="cart-item-cat mt-0">${formatMoney(item.price)} each</p>
          <button class="cart-item-remove" data-remove="${item.id}">Remove</button>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-total">${formatMoney(item.price * item.qty)}</span>
          <div class="qty-stepper">
            <button data-decrease="${item.id}" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button data-increase="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>
    `).join("");

    const subtotal = getCartSubtotal();
    const total = subtotal + (subtotal > 0 ? DELIVERY_FEE : 0);
    summary.querySelector("[data-subtotal]").textContent = formatMoney(subtotal);
    summary.querySelector("[data-delivery]").textContent = formatMoney(DELIVERY_FEE);
    summary.querySelector("[data-total]").textContent = formatMoney(total);

    list.querySelectorAll("[data-increase]").forEach(btn =>
      btn.addEventListener("click", () => {
        const item = getCart().find(i => i.id === btn.dataset.increase);
        setQty(btn.dataset.increase, item.qty + 1);
        render();
      })
    );
    list.querySelectorAll("[data-decrease]").forEach(btn =>
      btn.addEventListener("click", () => {
        const item = getCart().find(i => i.id === btn.dataset.decrease);
        if (item.qty <= 1){
          removeFromCart(btn.dataset.decrease);
        } else {
          setQty(btn.dataset.decrease, item.qty - 1);
        }
        render();
      })
    );
    list.querySelectorAll("[data-remove]").forEach(btn =>
      btn.addEventListener("click", () => {
        removeFromCart(btn.dataset.remove);
        showToast("Item removed");
        render();
      })
    );
  }

  render();
});
