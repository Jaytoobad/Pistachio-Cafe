/* =========================================================
   MAIN — shared interactions across pages
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");
  if (navToggle && navLinks){
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen);
    });
  }

  /* ---- Newsletter form (front-end only demo) ---- */
  const newsletterForm = document.querySelector("[data-newsletter-form]");
  if (newsletterForm){
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Thanks — you're on the list!");
      newsletterForm.reset();
    });
  }

  /* ---- Reviews (homepage) ---- */
  initReviews();
});

/* =========================================================
   REVIEWS
   -----------------------------------------------------------
   Starter reviews ship below. Anything a visitor submits is
   saved to localStorage so it persists for THEM on THIS
   device/browser — it won't appear for other visitors unless
   you wire this form up to a backend (e.g. a simple database
   or a form service like Formspree/Airtable).
   ========================================================= */

const REVIEWS_KEY = "pistachio_reviews";

const STARTER_REVIEWS = [
  {
    name: "Ama Owusu",
    role: "Regular, Saturday brunch",
    rating: 5,
    quote: "The shakshuka is unreal and the staff remember my order. My weekend doesn't start without this place."
  },
  {
    name: "Kwabena Asante",
    role: "First-time visitor",
    rating: 5,
    quote: "Walked in for coffee, stayed two hours for the brunch board. Genuinely one of the best in the city."
  },
  {
    name: "Linda Mensah",
    role: "Works nearby",
    rating: 4,
    quote: "My go-to for a working lunch. Would love a few more vegan dessert options, but the coffee alone keeps me coming back."
  }
];

function getReviews(){
  const stored = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
  return [...stored, ...STARTER_REVIEWS];
}

function renderReviews(){
  const grid = document.querySelector("[data-review-grid]");
  if (!grid) return;
  const reviews = getReviews();
  grid.innerHTML = reviews.map(r => `
    <article class="review-card">
      <div class="review-stars" aria-label="${r.rating} out of 5 stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <p class="review-quote">"${escapeHtml(r.quote)}"</p>
      <p class="review-name mt-0">${escapeHtml(r.name)}</p>
      <p class="review-role">${escapeHtml(r.role)}</p>
    </article>
  `).join("");
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function initReviews(){
  renderReviews();

  const form = document.querySelector("[data-review-form]");
  if (!form) return;

  let selectedRating = 5;
  const starButtons = form.querySelectorAll("[data-star]");
  const ratingInput = form.querySelector("[data-rating-value]");

  function paintStars(){
    starButtons.forEach(btn => {
      btn.classList.toggle("is-filled", Number(btn.dataset.star) <= selectedRating);
    });
    if (ratingInput) ratingInput.value = selectedRating;
  }
  paintStars();

  starButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedRating = Number(btn.dataset.star);
      paintStars();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("[name='name']").value.trim();
    const role = form.querySelector("[name='role']").value.trim() || "Customer";
    const quote = form.querySelector("[name='quote']").value.trim();
    if (!name || !quote) return;

    const stored = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
    stored.unshift({ name, role, rating: selectedRating, quote });
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(stored));

    renderReviews();
    form.reset();
    selectedRating = 5;
    paintStars();
    showToast("Thanks for your review!");
  });
}
