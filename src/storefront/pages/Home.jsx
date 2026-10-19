import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BRAND, DELIVERY_PROMISE, IMAGES } from '../config';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { useDishes } from '../hooks/useDishes';
import { useMenus } from '../hooks/useMenus';
import { useReviews } from '../hooks/useReviews';
import { useStoreStatus } from '../hooks/useStoreStatus';
import { submitReview } from '../services/reviews';
import DishCard from '../components/DishCard';
import DishDetailModal from '../components/DishDetailModal';
import '../../styles/storefront.css';

const REVIEWS_KEY = 'pi_reviews';

// React 18 does not know the `fetchPriority` prop, so it is passed through
// as a plain lowercase attribute (the name HTML uses) to avoid a console warning.
const HERO_IMG_PROPS = { fetchpriority: 'high' };

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
  const storeStatus = useStoreStatus();

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
    <>
      <main id="main" className="site-main">
        {/* ============ HERO ============ */}
        <section className="hero" aria-labelledby="hero-title">
          <img
            src={IMAGES.hero}
            alt=""
            className="hero-bg"
            {...HERO_IMG_PROPS}
            width="2400"
            height="1200"
          />
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <p className="hero-eyebrow">{storeStatus}</p>
            <h1 id="hero-title" className="hero-title">Breakfast, brunch, and the good kind of slow.</h1>
            <p className="hero-sub">Handmade pastries, slow-brewed coffee, and plates built for lingering. Order ahead, or come sit with us a while.</p>
            <div className="hero-cta">
              <Link to="/menu" className="btn-hero btn-hero-primary">See the menu</Link>
              <Link to="/about" className="btn-hero btn-hero-outline">Our story</Link>
            </div>
            <div className="hero-info-strip">
              <div className="hero-info-item">
                <div className="hero-info-label">Hours</div>
                <div className="hero-info-value">Mon–Fri 8AM–11PM · Sat–Sun 8AM–12AM</div>
              </div>
              <div className="hero-info-divider" aria-hidden="true"></div>
              <div className="hero-info-item">
                <div className="hero-info-label">Pickup & delivery</div>
                <div className="hero-info-value">Ready in {DELIVERY_PROMISE.pickup} min</div>
              </div>
              <div className="hero-info-divider" aria-hidden="true"></div>
              <div className="hero-info-item">
                <div className="hero-info-label">Location</div>
                <div className="hero-info-value">{BRAND.location}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FEATURED MENU ============ */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>What's on today</h2>
                <p>A few favourites from our breakfast, brunch, and dessert menu.</p>
              </div>
              <Link to="/menu" className="btn btn-outline">Full menu</Link>
            </div>
            <div className="grid grid-cols-2 grid-cols-3-md">
              {renderFeatured()}
            </div>
          </div>
        </section>

        {/* ============ ABOUT TEASER (premium story card) ============ */}
        <section className="section section-alt">
          <div className="container">
            <div className="story-card">
              <h2>A neighbourhood table, done with care</h2>
              <p>Pistachio started as a single espresso cart and grew into a full kitchen — but the goal never changed: make people feel properly looked after over a good plate of food.</p>
              <p>We bake daily, source from growers we know by name, and treat every table — regulars and first-timers alike — like they're the reason we opened the doors.</p>
              <Link to="/about" className="btn btn-primary">Read our story</Link>
            </div>
          </div>
        </section>

        {/* ============ REVIEWS ============ */}
        <section className="section" id="reviews">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>What people are saying</h2>
                <p>Real notes from real tables.</p>
              </div>
            </div>
            <div className="review-carousel">
              {renderReviews()}
            </div>

            <div className="review-form">
              <h3>Leave a review</h3>
              <p>Tell us what you loved, or what we could do better.</p>
              <form onSubmit={handleReviewSubmit} data-review-form>
                <div className="form-grid-2">
                  <div className="form-row">
                    <label htmlFor="rev-name">Your name</label>
                    <input type="text" id="rev-name" name="name" required value={reviewForm.name} onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <label htmlFor="rev-role">How you know us (optional)</label>
                    <input type="text" id="rev-role" name="role" placeholder="e.g. Weekend regular" value={reviewForm.role} onChange={(e) => setReviewForm((f) => ({ ...f, role: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <label>Rating</label>
                  <div className="star-select" data-rating-group>
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
                <div className="form-row">
                  <label htmlFor="rev-quote">Your review</label>
                  <textarea id="rev-quote" name="quote" rows={3} required value={reviewForm.quote} onChange={(e) => setReviewForm((f) => ({ ...f, quote: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
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
    </>
  );
}
