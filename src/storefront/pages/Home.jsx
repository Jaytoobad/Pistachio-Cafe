import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../config';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { useDishes } from '../hooks/useDishes';
import { useMenus } from '../hooks/useMenus';
import { useReviews } from '../hooks/useReviews';
import { submitReview } from '../services/reviews';
import DishCard from '../components/DishCard';
import DishDetailModal from '../components/DishDetailModal';
import '../../styles/storefront.css';

const REVIEWS_KEY = 'pi_reviews';

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export default function Home() {
  const { add } = useCart();
  const { showToast } = useToast();
  const [reviewForm, setReviewForm] = useState({ name: '', role: '', rating: 5, quote: '' });
  const [submitting, setSubmitting] = useState(false);
  const [quickView, setQuickView] = useState(null);

  const { dishes } = useDishes();
  const { menus } = useMenus();
  const { reviews, loading } = useReviews();

  const menuNameForDish = (dish) => {
    if (dish.menu_name) return dish.menu_name;
    if (dish.menu && dish.menu.name) return dish.menu.name;
    const m = menus.find((x) => x.id === dish.menu_id);
    return m ? m.name : '';
  };

  const featured = dishes.filter((d) => d.is_featured);

  const addToCart = (dish, qty = 1) => {
    add({ id: dish.id, name: dish.name, price: dish.price, image_url: dish.image_url || null }, qty);
    showToast(`${dish.name} added to cart`);
  };

  const renderFeatured = () => {
    return featured.map((p) => (
      <DishCard
        key={p.id}
        dish={p}
        onAdd={addToCart}
        onQuickView={setQuickView}
      />
    ));
  };

  const renderReviews = () => {
    return reviews.map((r, idx) => (
      <article key={`${r.customer_name}-${r.rating}-${idx}`} className="review-card-snap sf-review-card-snap">
        <div className="sf-review-stars" aria-label={`${r.rating} out of 5 stars`}>
          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
        </div>
        <p className="sf-review-quote">"{escapeHtml(r.comment)}"</p>
        <p className="sf-review-name">{escapeHtml(r.customer_name)}</p>
        {r.dish_name && <p className="sf-review-role">{escapeHtml(r.dish_name)}</p>}
      </article>
    ));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.quote.trim()) return;

    setSubmitting(true);

    const stored = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    const newReview = { name: reviewForm.name.trim(), role: reviewForm.role.trim() || 'Customer', rating: reviewForm.rating, quote: reviewForm.quote.trim() };
    stored.unshift(newReview);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(stored));

    try {
      await submitReview({
        customer_name: reviewForm.name.trim(),
        dish_id: null,
        dish_name: null,
        rating: reviewForm.rating,
        comment: reviewForm.quote.trim(),
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error('Failed to submit review to Supabase', err);
    }

    setReviewForm({ name: '', role: '', rating: 5, quote: '' });
    showToast('Thanks for your review!');
    setSubmitting(false);
  };

  const handleStar = (n) => {
    setReviewForm((f) => ({ ...f, rating: n }));
  };

  return (
    <div className="old-container min-h-dvh">
      <main id="main" className="old-main">

        {/* ============ HERO ============ */}
        <section className="old-hero hero-section hero-full" aria-labelledby="hero-title">
          <div className="old-hero-inner hero-inner hero-inner-full">
            <p className="old-hero-eyebrow hero-eyebrow text-amber-700">Good mornings, done properly</p>
            <h1 id="hero-title" className="hero-title font-serif text-charcoal leading-tight">Breakfast, brunch, and the good kind of slow.</h1>
            <p className="old-hero-sub hero-sub text-muted max-w-prose leading-relaxed">Handmade pastries, slow-brewed coffee, and plates built for lingering. Order ahead, or come sit with us a while.</p>
            <div className="old-hero-cta hero-cta gap-3">
              <Link to="/menu" className="old-btn old-btn-accent btn-cafe btn-cafe-primary">See the menu</Link>
              <Link to="/about" className="old-btn old-btn-outline btn-cafe btn-cafe-outline">Our story</Link>
            </div>
            <div className="old-hero-info-strip hero-hours mt-8 mb-4">
              <div><strong>Mon–Fri 8AM–11PM</strong> · <strong>Sat–Sun 8AM–12AM</strong></div>
              <div><strong>Pickup &amp; delivery</strong> · Ready in 20 min</div>
              <div><strong>{BRAND.location}</strong></div>
            </div>
          </div>
        </section>

        {/* ============ FEATURED MENU ============ */}
        <section className="old-section">
          <div className="old-container px-4 py-6">
            <div className="old-section-head">
              <div>
                <h2>What's on today</h2>
                <p>A few favourites from our breakfast, brunch, and dessert menu.</p>
              </div>
              <Link to="/menu" className="old-btn old-btn-outline">Full menu</Link>
            </div>
            <div className="grid-cols-2" data-featured-grid>
              {renderFeatured()}
            </div>
          </div>
        </section>

        {/* ============ ABOUT TEASER (premium story card) ============ */}
        <section className="old-section old-section-alt py-6">
          <div className="old-container px-4">
            <div className="story-card">
              <h2>A neighbourhood table, done with care</h2>
              <p className="text-muted leading-relaxed mb-4">Pistachio started as a single espresso cart and grew into a full kitchen — but the goal never changed: make people feel properly looked after over a good plate of food.</p>
              <p className="text-muted leading-relaxed mb-4">We bake daily, source from growers we know by name, and treat every table — regulars and first-timers alike — like they're the reason we opened the doors.</p>
              <Link to="/about" className="old-btn old-btn-primary btn-cafe btn-cafe-primary">Read our story</Link>
            </div>
          </div>
        </section>

        {/* ============ REVIEWS ============ */}
        <section className="old-section" id="reviews">
          <div className="old-container px-4 py-6">
            <div className="old-section-head">
              <div>
                <h2>What people are saying</h2>
                <p>Real notes from real tables.</p>
              </div>
            </div>
            <div className="review-carousel" data-review-grid>
              {renderReviews()}
            </div>

            <div className="old-review-form mt-8">
              <h3>Leave a review</h3>
              <p>Tell us what you loved, or what we could do better.</p>
              <form onSubmit={handleReviewSubmit} data-review-form>
                <div className="old-form-grid-2">
                  <div className="old-form-row">
                    <label htmlFor="rev-name">Your name</label>
                    <input type="text" id="rev-name" name="name" required value={reviewForm.name} onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="old-form-row">
                    <label htmlFor="rev-role">How you know us (optional)</label>
                    <input type="text" id="rev-role" name="role" placeholder="e.g. Weekend regular" value={reviewForm.role} onChange={(e) => setReviewForm((f) => ({ ...f, role: e.target.value }))} />
                  </div>
                </div>
                <div className="old-form-row">
                  <label>Rating</label>
                  <div className="old-star-select" data-rating-group>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        data-star={star}
                        aria-label={`${star} star`}
                        className={star <= reviewForm.rating ? 'is-filled' : ''}
                        onClick={() => handleStar(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="rating" data-rating-value value={reviewForm.rating} />
                </div>
                <div className="old-form-row">
                  <label htmlFor="rev-quote">Your review</label>
                  <textarea id="rev-quote" name="quote" rows={3} required value={reviewForm.quote} onChange={(e) => setReviewForm((f) => ({ ...f, quote: e.target.value }))} />
                </div>
                <button type="submit" className="old-btn old-btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit review'}
                </button>
              </form>
            </div>
          </div>
        </section>

      </main>

      {quickView && (
        <DishDetailModal
          open={!!quickView}
          dish={quickView}
          menuName={menuNameForDish(quickView, menus)}
          onClose={() => setQuickView(null)}
          onAdd={(d, qty) => {
            addToCart(d, qty);
          }}
        />
      )}
    </div>
  );
}
