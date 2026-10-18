/* =========================================================
   CART
   -----------------------------------------------------------
   Cart state lives in localStorage under the key below, so it
   survives page navigation and browser refreshes on this
   device. It is NOT synced to a server — for a real multi-
   device cart you'd move this into a backend + user accounts.
   ========================================================= */

const CART_KEY = "pistachio_cart";
const DELIVERY_FEE = 10.00;

function getCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error("Cart read failed", e);
    return [];
  }
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartBadge();
}

function addToCart(productId, qty = 1){
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing){
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  saveCart(cart);
}

function removeFromCart(productId){
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
}

function setQty(productId, qty){
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart(cart);
}

function clearCart(){
  saveCart([]);
}

function getCartCount(){
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCartDetailed(){
  // Joins cart quantities with live product data, skipping any
  // items whose product no longer exists in products.js
  return getCart()
    .map(item => {
      const product = typeof findProduct === "function" ? findProduct(item.id) : null;
      return product ? { ...product, qty: item.qty } : null;
    })
    .filter(Boolean);
}

function getCartSubtotal(){
  return getCartDetailed().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function formatMoney(n){
  return "GH₵" + n.toFixed(2);
}

function renderCartBadge(){
  const badge = document.querySelector("[data-cart-badge]");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.hidden = count === 0;
}

function showToast(message){
  let toast = document.querySelector(".toast");
  if (!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

document.addEventListener("DOMContentLoaded", renderCartBadge);
