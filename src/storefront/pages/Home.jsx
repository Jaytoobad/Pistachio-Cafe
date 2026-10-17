import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedDishes } from '../services/dishes.index';
import { fetchApprovedReviews, submitReview } from '../services/reviews';
import DishCard from '../components/DishCard';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';
import SectionHeading from '../components/SectionHeading';
import { useCart } from '../context/CartContext';
import { BRAND, HOURS, CONTACT, IMAGES, HAS_PHONE } from '../config';
import { formatMoney } from '../../lib/format';
import { useToast } from '../../lib/context/ToastContext';

export default function Home() {
  const { add } = useCart();
  const { showToast } = useToast();
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);  const [reviewForm, setReviewForm] = useState({ customer_name: '', rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  const load = useCallback(async () => {
    let active = true;
    setLoading(true);
    setError(false);
    try {
      const [items, approved] = await Promise.all([fetchFeaturedDishes(), fetchApprovedReviews()]);
      if (active) { setFeatured(items || []); setReviews(approved || []); }
    } catch (e) {
      if (active) { setError(true); setFeatured([]); setReviews([]); }
    } finally {
      if (active) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    load();
    return () => { active = false; };
  }, [load]);

  const handleStar = useCallback((n) => setReviewForm((f) => ({ ...f, rating: n })), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null);
    if (!reviewForm.customer_name.trim()) { setFormMessage({ text: 'Please enter your name.', type: 'error' }); return; }
    if (!reviewForm.rating) { setFormMessage({ text: 'Please select a rating.', type: 'error' }); return; }
    if (!reviewForm.comment.trim()) { setFormMessage({ text: 'Please write your review.', type: 'error' }); return; }
    setSubmitting(true);
    try {
      await submitReview({
        customer_name: reviewForm.customer_name.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      setReviewForm({ customer_name: '', rating: 0, comment: '' });
      setFormMessage({ text: 'Thank you — your review will appear once it is approved.', type: 'success' });
      fetchApprovedReviews().then((r) => setReviews(r || []));
    } catch (err) {
      setFormMessage({ text: err?.message || 'Could not submit your review. Try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const addToCart = (dish) => {
    add(dish, 1);
    showToast(`${dish.name} added to cart`);
  };

  if (error) {
    return (
      <div className="sf-container">
        <div className="sf-section">
          <div className="sf-error" role="alert">
            <h3>Something went wrong</h3>
            <p>We couldn't load the content. Please try again.</p>
            <button className="sf-btn sf-btn-primary" style={{ marginTop: 12 }} onClick={load}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="sf-container" style={{ paddingTop: 60 }}>
        <div className="sf-loading">
          <div className="sf-spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  return (
    <div className="sf-container">
        <section className="sf-hero" aria-labelledby="hero-title">
          <img
            className="sf-hero-bg"
            src={IMAGES.hero}
            alt="Pistachio Café ambiance"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.onerror = null; e.target.src = IMAGES.heroCoffee; }}
          />
        <div className="sf-hero-inner">
          <p className="sf-hero-eyebrow" id="hero-eyebrow">{BRAND.location} · {BRAND.offerings.join(' · ')}</p>
          <h1 id="hero-title">{BRAND.name}</h1>
          <p>{BRAND.tagline}</p>
          <div className="sf-hero-cta">
            <Link to="/menu" className="sf-btn sf-btn-primary">See the menu</Link>
            <Link to="/track" className="sf-btn sf-btn-ghost">Track an order</Link>
          </div>
          <div className="sf-hero-info">
            <div>
              <strong>Opening hours</strong>
              <span>Weekdays {HOURS.weekday.open} – {HOURS.weekday.close} · Weekends {HOURS.weekend.open} – {HOURS.weekend.close}</span>
            </div>
            <div>
              <strong>Location</strong>
              <span>{BRAND.location}</span>
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="sf-section">
          <SectionHeading title="Featured" subtitle="Fresh from the kitchen" />
          <div className="sf-grid">
            {featured.map((dish) => (
              <DishCard key={dish.id} dish={dish} onAdd={addToCart} />
            ))}
          </div>
        </section>
      )}

      <section className="sf-section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "clamp(24px, 6vw, 48px)", alignItems: "center" }}>
          <div>
            <p className="sf-hero-eyebrow">About Pistachio Café</p>
            <h2>A café in Spintex, Accra</h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>
              {BRAND.offerings.join(', ').toLowerCase()} in the heart of {BRAND.location}. {BRAND.tagline}.
            </p>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 14 }}>
              Open early until late — drop by for coffee, linger over dessert, or unwind with shisha.
              Order online for pickup or delivery.
            </p>
            <Link to="/about" className="sf-btn sf-btn-ghost">Read more</Link>
          </div>
          <div style={{ aspectRatio: '4 / 3', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={IMAGES.about} alt="Inside Pistachio Café" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
          </div>
        </div>
      </section>

      <section className="sf-section">
        <SectionHeading title="Customer reviews" subtitle="What our guests are saying" />
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>No reviews yet. Be the first to share your experience.</p>
        ) : (
          <div className="sf-review-grid">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
        <form className="sf-review-form" onSubmit={handleSubmit} aria-label="Leave a review">
          <h3>Leave a review</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0 0 18px' }}>Share your experience — it will appear once approved.</p>
          {formMessage && (
            <p style={{ margin: '0 0 12px', color: formMessage.type === 'error' ? 'var(--color-error)' : 'var(--color-success)', fontSize: '0.88rem', fontWeight: 600 }}>{formMessage.text}</p>
          )}
          <div className="sf-field">
            <label htmlFor="home-review-name">Name</label>
            <input id="home-review-name" value={reviewForm.customer_name} onChange={(e) => setReviewForm((f) => ({ ...f, customer_name: e.target.value }))} placeholder="Your name" required />
          </div>
          <div className="sf-field">
            <label>Rating</label>
            <StarRating value={reviewForm.rating} onChange={handleStar} />
          </div>
          <div className="sf-field">
            <label htmlFor="home-review-comment">Your review</label>
            <textarea id="home-review-comment" value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} rows={4} placeholder="What did you enjoy?" required />
          </div>
          <button type="submit" className="sf-btn sf-btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit review'}</button>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: 10 }}>Reviews are moderated before they appear.</p>
        </form>
      </section>

      <section className="sf-section" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '32px 28px' }}>
        <SectionHeading title="Visit us" subtitle={BRAND.location} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 28 }}>
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Opening hours</h3>
            <p style={{ margin: 0, color: "var(--color-text-muted)" }}>Weekdays <strong>{HOURS.weekday.open} – {HOURS.weekday.close}</strong></p>
            <p style={{ margin: "4px 0 0", color: "var(--color-text-muted)" }}>Weekends <strong>{HOURS.weekend.open} – {HOURS.weekend.close}</strong></p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Location</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{BRAND.location}</p>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>TODO: exact street address pending owner confirmation.</p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Contact</h3>
            {HAS_PHONE && (
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></p>
            )}
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>TODO: confirm phone with owner.</p>
          </div>
        </div>
      </section>
    </div>
  );
}







