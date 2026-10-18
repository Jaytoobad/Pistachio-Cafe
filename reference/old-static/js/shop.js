/* =========================================================
   SHOP PAGE — renders PRODUCTS (see products.js) into cards
   and wires up the category filter pills.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("[data-product-grid]");
  const pills = document.querySelectorAll("[data-filter]");
  if (!grid) return;

  function render(category){
    const items = category === "all"
      ? PRODUCTS
      : PRODUCTS.filter(p => p.category === category);

    grid.innerHTML = items.map(productCardHtml).join("") ||
      `<p>No items in this category yet — check back soon.</p>`;

    grid.querySelectorAll("[data-add]").forEach(btn => {
      btn.addEventListener("click", () => {
        addToCart(btn.dataset.add, 1);
        const original = btn.textContent;
        btn.textContent = "Added ✓";
        btn.classList.add("is-added");
        showToast(`${btn.closest(".product-card").querySelector("h3").textContent} added to cart`);
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove("is-added");
        }, 1200);
      });
    });
  }

  function productCardHtml(p){
    return `
      <article class="product-card">
        <div class="product-card-media">
          <span class="product-tag">${capitalize(p.category)}</span>
          <img src="${p.image}" alt="${escapeAttr(p.name)}" loading="lazy"
               onerror="this.closest('.product-card-media').style.display='flex';this.closest('.product-card-media').style.alignItems='center';this.closest('.product-card-media').style.justifyContent='center';this.replaceWith(Object.assign(document.createElement('span'),{textContent:'Add photo: ${escapeAttr(p.image)}',style:'font-size:0.75rem;color:#8b8570;padding:0 1rem;text-align:center'}))">
        </div>
        <div class="product-card-body">
          <h3>${escapeAttr(p.name)}</h3>
          <p>${escapeAttr(p.desc)}</p>
          <div class="product-card-foot">
            <span class="price">${formatMoney(p.price)}</span>
            <button class="add-btn" data-add="${p.id}">Add to cart</button>
          </div>
        </div>
      </article>
    `;
  }

  function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  function escapeAttr(s){ const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.setAttribute("aria-pressed", "false"));
      pill.setAttribute("aria-pressed", "true");
      render(pill.dataset.filter);
    });
  });

  // honor ?category= in the URL, e.g. from homepage "See breakfast" links
  const urlCategory = new URLSearchParams(location.search).get("category");
  const initial = urlCategory && [...pills].some(p => p.dataset.filter === urlCategory)
    ? urlCategory
    : "all";
  pills.forEach(p => p.setAttribute("aria-pressed", String(p.dataset.filter === initial)));
  render(initial);
});
