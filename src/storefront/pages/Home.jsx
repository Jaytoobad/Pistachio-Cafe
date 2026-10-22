import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BRAND, HOURS, CONTACT, HAS_PHONE, IMAGES, isPlaceholderContact, DELIVERY_PROMISE } from '../config';
import { HOME_ABOUT_TEASER, HERO_HOURS_TEXT, STARTER_REVIEWS } from '../data/content';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { useDishes } from '../hooks/useDishes';
import { useMenus } from '../hooks/useMenus';
import { useReviews } from '../hooks/useReviews';
import { useStoreStatus } from '../hooks/useStoreStatus';
import { submitReview } from '../services/reviews';
import { isSupabaseConfigured } from '../../lib/supabase';
import DishCard from '../components/DishCard';
import DishDetailModal from '../components/DishDetailModal';
import ReviewCard from '../components/ReviewCard';

const REVIEWS_KEY = 'pi_reviews';

function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}

function FreshIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 11a7 7 0 0 1 14 0z" />
      <path d="M5 11h14a7 7 0 0 1-14 0z" />
      <circle cx="9.5" cy="9" r="1" />
      <circle cx="14" cy="7.5" r="1" />
    </svg>
  );
}

function TrackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function StarIcon({ filled }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17l-5.25 2.75 1-5.85L3.5 9.75l5.9-.85z" />
    </svg>
  );
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function isDemoMode() {
  return !isSupabaseConfigured;
}

export default function Home() {
  const { add } = useCart();
  const { showToast } = useToast();
  const [reviewForm, setReviewForm] = useState({ name: '', role: '', rating: 5, quote: '' });
  const [submitting, setSubmitting] = useState(false);
  const [quickView, setQuickView] = useState(null);

  const { dishes } = useDishes();
  const { menus } = useMenus();
  const { reviews, loading: reviewsLoading } = useReviews();
  const storeStatus = useStoreStatus();

  // Menu carousel (shop by menu)
  const menuScrollRef = useRef(null);
  const [menuProgress, setMenuProgress] = useState(0);
  const handleMenuScroll = () => {
    const el = menuScrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setMenuProgress(max > 0 ? el.scrollLeft / max : 0);
  };
  const scrollMenu = (dir) => {
    const el = menuScrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  // Reviews carousel
  const reviewScrollRef = useRef(null);

  const menuNameForDish = (dish) => {
    if (dish.menu_name) return dish.menu_name;
    if (dish.menu && dish.menu.name) return dish.menu.name;
    const m = menus.find((x) => x.id === dish.menu_id);
    return m ? m.name : '';
  };

  const featured = dishes.filter((d) => d.is_featured);

  const dessertsMenu = menus.find((m) => /dessert/i.test(m.name) || /dessert/i.test(m.slug || ''));
  const desserts = dessertsMenu
    ? dishes.filter((d) => d.menu_id === dessertsMenu.id || d.menu?.id === dessertsMenu.id)
    : dishes.filter((d) => /dessert/i.test(d.menu_name || ''));

  const addToCart = (dish, qty = 1) => {
    add({ id: dish.id, name: dish.name, price: dish.price, image_url: dish.image_url || null }, qty);
    showToast(`${dish.name} added to cart`);
  };

  // Reviews: filter to non-empty quote + name
  const realReviews = reviews.filter((r) => (r.comment || r.quote || '').trim() && (r.customer_name || r.name || '').trim());
  const hasApproved = realReviews.length > 0;
  const showStarter = !hasApproved && isDemoMode();
  const visibleReviews = hasApproved ? realReviews : (showStarter ? STARTER_REVIEWS : []);

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

  const handleStar = (n) => setReviewForm((f) => ({ ...f, rating: n }));

  // Open/closed badge
  const isOpen = storeStatus.toLowerCase().startsWith('open');

  return (
    <>
      <div className="site-main">
        {/* ============ HERO ============ */}
        <section
          className="hero-full"
          aria-labelledby="hero-title"
          style={{ height: '62svh', minHeight: '520px', position: 'relative', overflow: 'hidden', background: 'var(--color-espresso)' }}
        >
          <style>{`@media (min-width: '1024px'){ .hero-full{ height: 68svh; max-height: '620px'; } }`}</style>
          <img
            src={IMAGES.hero}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'none', opacity: 0.35 }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(20,17,14,0.88) 0%, rgba(20,17,14,0.3) 55%, rgba(20,17,14,0) 78%)' }} />
          <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'flex-start', paddingTop: '80px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px 36px' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--color-ochre)', fontSize: '1.05rem', margin: '0 0 0.75rem' }}>Good mornings, done properly</p>
              <h1 id="hero-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 5.5vw, 3.6rem)', lineHeight: 1.06, maxWidth: '16ch', color: '#fff', margin: '0 0 0.85rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                Breakfast, brunch, and the good kind of slow.
              </h1>
              <p style={{ color: '#EFE7D8', fontSize: '1.02rem', margin: '0 0 1.5rem', maxWidth: '46ch' }}>
                Handmade pastries, slow-brewed coffee, and plates built for lingering. Order ahead, or come sit with us a while.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link to="/menu" className="btn-hero btn-hero-primary">See the menu</Link>
                <Link to="/about" className="btn-hero btn-hero-outline">Our story</Link>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.22)', marginTop: '1.5rem', paddingTop: '1.1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem 2.25rem', maxWidth: '780px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)', marginBottom: '0.35rem' }}>Hours</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#fff' }}>{HERO_HOURS_TEXT}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)', marginBottom: '0.35rem' }}>Location</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#fff' }}>{BRAND.location}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ DELIVERY STRIP ============ */}
        <section style={{ background: '#FFFDF8', borderBottom: '1px solid #E7E2D8' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', gap: '24px', overflowX: 'auto', flexWrap: 'wrap' }}>
            {[
              { icon: <TruckIcon />, text: 'Fast delivery in Spintex and Accra' },
              { icon: <FreshIcon />, text: 'Made fresh daily' },
              { icon: <TrackIcon />, text: 'Track your order live' },
            ].map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', fontSize: '0.9rem', fontWeight: 600, color: '#1A1A1A' }}>
                <span style={{ display: 'inline-flex', color: '#D97706' }}>{it.icon}</span> {it.text}
              </div>
            ))}
          </div>
        </section>

        {/* ============ SHOP BY MENU CAROUSEL ============ */}
        <section style={{ padding: '96px 0 56px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <h2 className="home-section-title">Shop by menu</h2>
            
            <div
              ref={menuScrollRef}
              onScroll={handleMenuScroll}
              style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', paddingBottom: '8px' }}
            >
              {menus.map((m) => (
                <Link
                  key={m.id}
                  to={`/menu?category=${m.slug}`}
                  style={{
                    flex: '0 0 auto',
                    width: 'calc((100% - 48px) / 4)',
                    minWidth: '200px',
                    aspectRatio: '3 / 4',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    scrollSnapAlign: 'start',
                    textDecoration: 'none',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #7FA356, #2D5A3D)',
                  }}
                >
                  <img
                    src={`/images/menus/${m.slug}.jpg`}
                    alt={m.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)' }} />
                  <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Order now</div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
              <div style={{ flex: 1, height: '2px', background: '#E7E2D8', borderRadius: '1px', overflow: 'hidden', marginRight: '16px' }}>
                <div style={{ height: '100%', width: `${menuProgress * 100}%`, background: '#D97706', transition: 'width 100ms ease' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => scrollMenu(-1)} aria-label="Previous" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E7E2D8', background: '#fff', cursor: 'pointer' }}>&lsaquo;</button>
                <button type="button" onClick={() => scrollMenu(1)} aria-label="Next" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E7E2D8', background: '#fff', cursor: 'pointer' }}>&rsaquo;</button>
              </div>
            </div>
          </div>
        </section>

        {/* ============ POPULAR RIGHT NOW ============ */}
        <section style={{ padding: '0 0 96px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <h2 className="home-section-title">Popular right now</h2>
            
            <div className="grid grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {featured.map((p) => (
                <DishCard key={p.id} dish={p} onAdd={addToCart} onQuickView={setQuickView} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ SWEET TREATS ============ */}
        <section style={{ padding: '0 0 96px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <h2 className="home-section-title">Sweet treats</h2>
            
            <div className="grid grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {desserts.slice(0, 4).map((p) => (
                <DishCard key={p.id} dish={p} onAdd={addToCart} onQuickView={setQuickView} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link to="/menu" className="btn btn-outline" style={{ border: '1.5px solid #1A1A1A', color: '#1A1A1A', padding: '0.85rem 1.6rem', borderRadius: '6px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>See the full menu</Link>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section style={{ padding: '0 0 96px', background: '#F5F2EB' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px' }}>
            <h2 className="home-section-title">How it works</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
              {[
                { title: 'Choose', text: 'Browse the menu and pick your favourites.' },
                { title: 'Pay', text: 'Secure checkout with Paystack.' },
                { title: 'Track', text: 'Follow your order every step of the way.' },
                { title: 'Enjoy', text: 'Fresh plates delivered to your door.' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', margin: '0 auto 12px', color: '#D97706' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40"><circle cx="12" cy="12" r="10" /></svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: '0 0 4px' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#5A554E', margin: 0 }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ ABOUT TEASER ============ */}
        <section style={{ padding: '0 0 96px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', aspectRatio: '4 / 3' }}>
              <img src={IMAGES.about} alt="About" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', margin: '0 0 12px' }}>{HOME_ABOUT_TEASER.heading}</h2>
              <p style={{ color: '#5A554E', lineHeight: 1.6, margin: '0 0 12px' }}>{HOME_ABOUT_TEASER.body}</p>
              <p style={{ color: '#5A554E', lineHeight: 1.6, margin: '0 0 24px' }}>{HOME_ABOUT_TEASER.body2}</p>
              <Link to="/about" style={{ border: '1.5px solid #1A1A1A', color: '#1A1A1A', padding: '0.85rem 1.6rem', borderRadius: '6px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Read our story</Link>
            </div>
          </div>
        </section>

        {/* ============ REVIEWS ============ */}
        <section style={{ padding: '0 0 96px' }} id="reviews">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <h2 className="home-section-title">What people are saying</h2>
            
            {visibleReviews.length > 0 && (
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '16px', scrollbarWidth: 'none' }}>
                {visibleReviews.map((r, idx) => (
                  <div key={idx} style={{ flex: '0 0 auto', width: '320px', scrollSnapAlign: 'start' }}>
                    <ReviewCard review={{ customer_name: r.name || r.customer_name, comment: r.quote || r.comment, rating: r.rating, dish_name: r.dish_name }} />
                  </div>
                ))}
              </div>
            )}
            <div style={{ maxWidth: '640px', margin: '32px auto 0', background: '#F5F2EB', border: '1px solid #E7E2D8', borderRadius: '10px', padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 4px' }}>Leave a review</h3>
              <p style={{ color: '#5A554E', fontSize: '0.9rem', margin: '0 0 16px' }}>Tell us what you loved, or what we could do better.</p>
              <form onSubmit={handleReviewSubmit} data-review-form>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Your name</label>
                    <input type="text" required value={reviewForm.name} onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '0.75em 0.9em', border: '1.5px solid #E7E2D8', borderRadius: '6px', background: '#FFFDF8' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>How you know us (optional)</label>
                    <input type="text" value={reviewForm.role} onChange={(e) => setReviewForm((f) => ({ ...f, role: e.target.value }))} style={{ width: '100%', padding: '0.75em 0.9em', border: '1.5px solid #E7E2D8', borderRadius: '6px', background: '#FFFDF8' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => handleStar(star)} aria-label={`${star} of 5 stars`} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: star <= reviewForm.rating ? '#C7862A' : '#E7E2D8' }}>
                        <StarIcon filled={star <= reviewForm.rating} />
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Your review</label>
                  <textarea rows={3} required value={reviewForm.quote} onChange={(e) => setReviewForm((f) => ({ ...f, quote: e.target.value }))} style={{ width: '100%', padding: '0.75em 0.9em', border: '1.5px solid #E7E2D8', borderRadius: '6px', background: '#FFFDF8' }} />
                </div>
                <button type="submit" disabled={submitting} style={{ background: '#D97706', color: '#fff', padding: '0.85rem 1.6rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', minHeight: '44px' }}>
                  {submitting ? 'Submitting\u2026' : 'Submit review'}
                </button>
                <div style={{ paddingBottom: '96px' }} />
              </form>
            </div>
          </div>
        </section>

        {/* ============ VISIT US ============ */}
        <section style={{ padding: '0 0 96px', background: '#2D5A3D', color: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px', textAlign: 'center' }}>
            <h2 className="home-section-title home-section-title--center">Visit us</h2>
            
            <p style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>{BRAND.location}</p>
            <p style={{ margin: '0 0 16px', fontSize: '0.9rem', opacity: 0.85 }}>
              {HERO_HOURS_TEXT}
              <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '999px', background: isOpen ? '#EAF3EC' : '#F1ECE9', color: isOpen ? '#3D6A46' : '#6B5F5A', fontSize: '0.7rem', fontWeight: 700 }}>
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ background: '#D97706', color: '#fff', padding: '0.85rem 1.6rem', borderRadius: '6px', fontWeight: 600, textDecoration: 'none' }}>Get directions</a>
              {HAS_PHONE && CONTACT.phone && !isPlaceholderContact(CONTACT.phone) && (
                <a href={`tel:${CONTACT.phone}`} style={{ border: '1.5px solid #fff', color: '#fff', padding: '0.85rem 1.6rem', borderRadius: '6px', fontWeight: 600, textDecoration: 'none' }}>Call us</a>
              )}
              {BRAND.instagramUrl && (
                <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ border: '1.5px solid #fff', color: '#fff', padding: '0.85rem 1.6rem', borderRadius: '6px', fontWeight: 600, textDecoration: 'none' }}>Instagram</a>
              )}
            </div>
          </div>
        </section>
      </div>

      {quickView && (
        <DishDetailModal
          open={!!quickView}
          dish={quickView}
          menuName={menuNameForDish(quickView, menus)}
          onClose={() => setQuickView(null)}
          onAdd={(d, qty) => addToCart(d, qty)}
        />
      )}
    </>
  );
}

