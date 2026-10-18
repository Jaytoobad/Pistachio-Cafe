import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { PRODUCTS, findProduct, formatMoney } from '../data/products';
import { BRAND } from '../config';
import { STARTER_REVIEWS } from '../data/content';
import { isSupabaseConfigured } from '../../lib/supabase';
import { fetchApprovedReviews, submitReview } from '../services/reviews';
import '../old-static.css';

const REVIEWS_KEY = 'pi_reviews';

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export default function Home() {
  const { add } = useCart();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ name: '', role: '', rating: 5, quote: '' });
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const addToCart = (productId) => {
    const product = findProduct(productId);
    if (!product) return;
    add({ id: product.id, name: product.name, price: product.price, image_url: product.image || null }, 1);
    showToast(`${product.name} added to cart`);
  };

  const loadReviews = useCallback(async () => {
    let approved = [];
    if (isSupabaseConfigured) {
      try {
        approved = await fetchApprovedReviews();
      } catch (err) {
        console.error('Failed to fetch approved reviews', err);
      }
    }

    if (approved && approved.length > 0) {
      setReviews(approved.map(r => ({
        name: r.customer_name,
        role: r.dish_name || 'Customer',
        rating: r.rating,
        quote: r.comment,
      })));
    } else {
      // Demo mode / no approved reviews yet: show localStorage + starter fallback.
      try {
        const stored = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
        const merged = Array.isArray(stored) ? [...stored, ...STARTER_REVIEWS] : STARTER_REVIEWS;
        setReviews(merged);
      } catch {
        setReviews(STARTER_REVIEWS);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const renderFeatured = () => {
    const categories = ['breakfast', 'brunch', 'dessert'];
    const featured = categories.map(cat => findProduct(cat)).filter(Boolean);
    return featured.map(p => (
      <article key={p.id} className="old-product-card">
        <div className="old-product-card-media">
          <span className="old-product-tag">{p.category.charAt(0).toUpperCase() + p.category.slice(1)}</span>
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            onError={(e) => {
              const media = e.currentTarget.closest('.old-product-card-media');
              if (media) {
                media.style.display = 'flex';
                media.style.alignItems = 'center';
                media.style.justifyContent = 'center';
                const span = document.createElement('span');
                span.textContent = 'Add photo: ' + p.image;
                span.style.fontSize = '0.75rem';
                span.style.color = '#8b8570';
                span.style.padding = '0 1rem';
                span.style.textAlign = 'center';
                e.currentTarget.replaceWith(span);
              }
            }}
          />
        </div>
        <div className="old-product-card-body">
          <h3>{p.name}</h3>
          <p>{p.desc}</p>
          <div className="old-product-card-foot">
            <span className="old-price">{formatMoney(p.price)}</span>
            <button
              className="old-add-btn"
              onClick={() => addToCart(p.id)}
            >
              Add to cart
            </button>
          </div>
        </div>
      </article>
    ));
  };

  const renderReviews = () => {
    return reviews.map((r, idx) => (
      <article key={`${r.name}-${r.rating}-${idx}`} className="old-review-card">
        <div className="old-review-stars" aria-label={`${r.rating} out of 5 stars`}>
          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
        </div>
        <p className="old-review-quote">"{escapeHtml(r.quote)}"</p>
        <p className="old-review-name old-mt-0">{escapeHtml(r.name)}</p>
        <p className="old-review-role">{escapeHtml(r.role)}</p>
      </article>
    ));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.quote.trim()) return;

    setSubmitting(true);

    // Save to localStorage immediately so it shows on this device.
    const stored = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    const newReview = { name: reviewForm.name.trim(), role: reviewForm.role.trim() || 'Customer', rating: reviewForm.rating, quote: reviewForm.quote.trim() };
    stored.unshift(newReview);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(stored));
    setReviews([newReview, ...reviews]);

    // Insert into public.reviews with is_approved = false (pending moderation).
    if (isSupabaseConfigured) {
      try {
        await submitReview({
          customer_name: reviewForm.name.trim(),
          dish_id: null,
          dish_name: null,
          rating: reviewForm.rating,
          comment: reviewForm.quote.trim(),
        });
      } catch (err) {
        console.error('Failed to submit review to Supabase', err);
      }
    }

    setReviewForm({ name: '', role: '', rating: 5, quote: '' });
    showToast('Thanks for your review!');
    setSubmitting(false);
  };

  const handleStar = (n) => {
    setReviewForm((f) => ({ ...f, rating: n }));
  };

  return (
    <div className="old-container">
      <main id="main" className="old-main">

        {/* ============ HERO ============ */}
        <section className="old-hero" aria-labelledby="hero-title">
          <div className="old-hero-inner">
            <p className="old-hero-eyebrow">Good mornings, done properly</p>
            <h1 id="hero-title">Breakfast, brunch, and the good kind of slow.</h1>
            <p className="old-hero-sub">Handmade pastries, slow-brewed coffee, and plates built for lingering. Order ahead, or come sit with us a while.</p>
            <div className="old-hero-cta">
              <Link to="/menu" className="old-btn old-btn-accent">See the menu</Link>
              <Link to="/about" className="old-btn old-btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}>Our story</Link>
            </div>
            <div className="old-hero-info-strip">
              <div><strong>Mon–Fri 8AM–11PM · Sat–Sun 8AM–12AM</strong>Opening hours</div>
              <div><strong>Pickup &amp; delivery</strong>Order online, ready in 20 min</div>
              <div><strong>{BRAND.location}</strong></div>
            </div>
          </div>
        </section>

        {/* ============ FEATURED MENU ============ */}
        <section className="old-section">
          <div className="old-container">
            <div className="old-section-head">
              <div>
                <h2>What's on today</h2>
                <p>A few favourites from our breakfast, brunch, and dessert menu.</p>
              </div>
              <Link to="/menu" className="old-btn old-btn-outline">Full menu</Link>
            </div>
            <div className="old-card-grid" data-featured-grid>
              {renderFeatured()}
            </div>
          </div>
        </section>

        {/* ============ ABOUT TEASER ============ */}
        <section className="old-section old-section-alt">
          <div className="old-container old-about-intro">
            <div>
              <h2>A neighbourhood table, done with care</h2>
              <p>Pistachio started as a single espresso cart and grew into a full kitchen — but the goal never changed: make people feel properly looked after over a good plate of food.</p>
              <p>We bake daily, source from growers we know by name, and treat every table — regulars and first-timers alike — like they're the reason we opened the doors.</p>
              <Link to="/about" className="old-btn old-btn-primary">Read our story</Link>
            </div>
            <div className="old-about-intro-media">
              <img
                src="images/about-cafe.jpg"
                alt="Inside Pistachio Café"
                loading="lazy"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.style.display = 'flex';
                    parent.style.alignItems = 'center';
                    parent.style.justifyContent = 'center';
                    const span = document.createElement('span');
                    span.textContent = 'Add photo: images/about-cafe.jpg';
                    span.style.fontSize = '0.8rem';
                    span.style.color = '#8b8570';
                    span.style.padding = '1rem';
                    span.style.textAlign = 'center';
                    e.currentTarget.replaceWith(span);
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* ============ REVIEWS ============ */}
        <section className="old-section" id="reviews">
          <div className="old-container">
            <div className="old-section-head">
              <div>
                <h2>What people are saying</h2>
                <p>Real notes from real tables.</p>
              </div>
            </div>
            <div className="old-review-grid" data-review-grid>
              {loading ? (
                <p>Loading reviews…</p>
              ) : (
                renderReviews()
              )}
            </div>

            <div className="old-review-form">
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
    </div>
  );
}
