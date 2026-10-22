import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BRAND,
  CONTACT,
  DAY_LABELS,
  HAS_PHONE,
  HAS_WHATSAPP,
  IMAGES,
  MENU_SECTION_IMAGES,
  accraNow,
  formatClock,
  hoursForDay,
} from '../config';
import {
  HOME_FAVOURITES,
  HOME_HERO,
  HOME_MENU,
  HOME_REVIEWS,
  HOME_STORY,
  HOME_VISIT,
} from '../data/content';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { imageExists, localImageExists } from '../lib/images';
import { useDishes } from '../hooks/useDishes';
import { useMenus } from '../hooks/useMenus';
import { useReviews } from '../hooks/useReviews';
import { currentStoreStatus } from '../hooks/useStoreStatus';
import { submitReview } from '../services/reviews';
import DishCard from '../components/DishCard';
import DishDetailModal from '../components/DishDetailModal';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';

// Monday first, then Sunday last, the way a cafe hours board reads.
const HOURS_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function Home() {
  useDocumentTitle('Pistachio Caf\u00e9 \u2014 Breakfast, brunch and dessert in Spintex');

  const { add } = useCart();
  const { showToast } = useToast();
  const { dishes } = useDishes();
  const { menus } = useMenus();
  const { reviews } = useReviews();

  const [quickView, setQuickView] = useState(null);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const now = accraNow();
  const status = currentStoreStatus();
  const todayIndex = now.getDay();
  const todayHours = hoursForDay(todayIndex);

  // Photos that are really on the site. A missing one falls back to the flat
  // pistachio tile, and the hero falls back to its green gradient.
  const heroPhoto = imageExists(IMAGES.hero) ? IMAGES.hero : null;
  const storyPhoto = imageExists(IMAGES.story) ? IMAGES.story : null;

  const visibleMenus = menus.filter((menu) => menu.is_visible !== false);

  // Up to four featured dishes, never the same dish twice.
  const featured = [];
  const seen = new Set();
  for (const dish of dishes) {
    if (!dish.is_featured || seen.has(dish.id)) continue;
    seen.add(dish.id);
    featured.push(dish);
    if (featured.length === 4) break;
  }

  // Only approved reviews, and only the ones with a quote to read.
  const visibleReviews = reviews.filter((review) => String(review.comment || '').trim());

  const hoursRows = HOURS_ORDER.map((dayIndex) => {
    const hours = hoursForDay(dayIndex);
    return {
      dayIndex,
      label: DAY_LABELS[dayIndex],
      open: formatClock(hours.open),
      close: formatClock(hours.close),
      isToday: dayIndex === todayIndex,
    };
  });

  const handleAdd = (dish, qty) => {
    add({ id: dish.id, name: dish.name, price: dish.price, image_url: dish.image_url || null }, qty);
    showToast(`${dish.name} added to cart`);
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError('');

    if (!reviewName.trim() || !reviewRating || !reviewText.trim()) {
      setReviewError(HOME_REVIEWS.missing);
      return;
    }

    setReviewBusy(true);
    try {
      await submitReview({
        customer_name: reviewName.trim(),
        rating: reviewRating,
        comment: reviewText.trim(),
      });
      setReviewName('');
      setReviewRating(0);
      setReviewText('');
      showToast(HOME_REVIEWS.success);
    } catch (err) {
      setReviewError(HOME_REVIEWS.error);
    } finally {
      setReviewBusy(false);
    }
  };

  return (
    <div className="home-page">
      {/* 1. Hero */}
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-media" aria-hidden="true">
          {heroPhoto && (
            <img src={heroPhoto} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          )}
        </div>
        <div className="home-hero-overlay" aria-hidden="true" />
        <div className="container home-hero-inner">
          <h1 id="home-hero-title" className="home-hero-title">
            {HOME_HERO.headline}
          </h1>
          <p className="home-hero-sub">{HOME_HERO.subline}</p>
          <div className="home-hero-actions">
            <Link to="/menu" className="btn-cafe btn-cafe-green">
              Order now
            </Link>
            <Link to="/menu" className="btn-cafe btn-cafe-outline-light">
              See the menu
            </Link>
          </div>
          <p className="home-hero-status">
            {status.isOpen ? 'Open now' : 'Closed'} &middot; Today {formatClock(todayHours.open)}&ndash;{formatClock(todayHours.close)}
          </p>
        </div>
      </section>

      {/* 2. Our menu */}
      <section className="home-section" aria-labelledby="home-menu-title">
        <div className="container">
          <div className="home-section-head">
            <h2 id="home-menu-title">{HOME_MENU.heading}</h2>
            <p>{HOME_MENU.intro}</p>
          </div>
          <div className="home-menu-grid">
            {visibleMenus.map((menu) => {
              const count = dishes.filter((dish) => dish.menu_id === menu.id).length;
              const photoPath = MENU_SECTION_IMAGES[menu.slug] || `/images/menus/${menu.slug}.jpg`;
              const photo = localImageExists(photoPath) ? photoPath : null;
              return (
                <Link key={menu.id} to={`/menu?category=${menu.slug}`} className="home-menu-tile">
                  <span className="home-menu-tile-media">
                    {photo ? (
                      <img src={photo} alt="" loading="lazy" />
                    ) : (
                      <span className="home-menu-tile-tint" aria-hidden="true" />
                    )}
                  </span>
                  <span className="home-menu-tile-body">
                    <span className="home-menu-tile-name">{menu.name}</span>
                    <span className="home-menu-tile-count">
                      {count} {count === 1 ? 'dish' : 'dishes'}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Customer favourites */}
      <section className="home-section home-section-alt" aria-labelledby="home-favourites-title">
        <div className="container">
          <div className="home-section-head">
            <h2 id="home-favourites-title">{HOME_FAVOURITES.heading}</h2>
          </div>
          <div className="dish-grid">
            {featured.map((dish) => (
              <DishCard key={dish.id} dish={dish} onAdd={handleAdd} onQuickView={setQuickView} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Our story */}
      <section className="home-section" aria-labelledby="home-story-title">
        <div className="container home-story">
          <div className="home-story-media">
            {storyPhoto && (
              <img src={storyPhoto} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            )}
          </div>
          <div className="home-story-text">
            <h2 id="home-story-title">{HOME_STORY.heading}</h2>
            <p>{HOME_STORY.body}</p>
            <Link to="/about" className="btn-cafe btn-cafe-outline">
              {HOME_STORY.button}
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Reviews */}
      <section className="home-section home-section-alt" aria-labelledby="home-reviews-title">
        <div className="container">
          <div className="home-section-head">
            <h2 id="home-reviews-title">{HOME_REVIEWS.heading}</h2>
          </div>

          {visibleReviews.length > 0 && (
            <div className="home-review-grid">
              {visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}

          <form className="home-review-form" onSubmit={handleReviewSubmit}>
            <h3>{HOME_REVIEWS.formHeading}</h3>
            <p className="home-review-form-intro">{HOME_REVIEWS.formIntro}</p>

            <div className="home-review-field">
              <label htmlFor="review-name">{HOME_REVIEWS.nameLabel}</label>
              <input
                id="review-name"
                name="customer_name"
                type="text"
                value={reviewName}
                onChange={(event) => setReviewName(event.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="home-review-field">
              <span className="home-review-label" id="review-rating-label">{HOME_REVIEWS.ratingLabel}</span>
              <StarRating value={reviewRating} onChange={setReviewRating} />
            </div>

            <div className="home-review-field">
              <label htmlFor="review-text">{HOME_REVIEWS.reviewLabel}</label>
              <textarea
                id="review-text"
                name="comment"
                rows={4}
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
              />
            </div>

            {reviewError && <p className="home-review-error" role="alert">{reviewError}</p>}

            <div className="home-review-submit">
              <button type="submit" className="btn-cafe btn-cafe-primary" disabled={reviewBusy}>
                {reviewBusy ? HOME_REVIEWS.sending : HOME_REVIEWS.submit}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 6. Visit us */}
      <section className="home-section" aria-labelledby="home-visit-title">
        <div className="container home-visit">
          <div className="home-visit-address">
            <h2 id="home-visit-title">{HOME_VISIT.heading}</h2>
            <h3>{HOME_VISIT.addressHeading}</h3>
            <p>{CONTACT.address}</p>
            <p className="home-visit-actions">
              <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-cafe btn-cafe-primary">
                {HOME_VISIT.directions}
              </a>
              <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="home-visit-link">
                {HOME_VISIT.instagram}
              </a>
              {HAS_PHONE && (
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="home-visit-link">
                  {CONTACT.phone}
                </a>
              )}
              {HAS_WHATSAPP && (
                <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className="home-visit-link">
                  WhatsApp
                </a>
              )}
            </p>
          </div>

          <div className="home-visit-hours">
            <h3>{HOME_VISIT.hoursHeading}</h3>
            <ul className="home-hours">
              {hoursRows.map((row) => (
                <li key={row.dayIndex} className={row.isToday ? 'home-hours-today' : undefined}>
                  <span className="home-hours-day">{row.label}</span>
                  <span className="home-hours-time">
                    {row.open}&ndash;{row.close}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {quickView && (
        <DishDetailModal
          open={!!quickView}
          dish={quickView}
          onClose={() => setQuickView(null)}
          onAdd={(dish, qty) => {
            handleAdd(dish, qty);
          }}
        />
      )}
    </div>
  );
}
