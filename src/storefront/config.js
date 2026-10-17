// ============================================================================
// storefront/config.js — single source of truth for the customer-facing site.
// Brand facts, image paths and contact details live here ONLY so that swapping
// an image or correcting a phone number is a one-line change.
// ============================================================================

// --- Brand ------------------------------------------------------------------

export const BRAND = {
  name: 'Pistachio Café',
  tagline: 'Elegance you can taste',
  // Location: Spintex, Accra, Ghana.
  location: 'Spintex, Accra, Ghana',
  // Offerings are real and confirmed.
  offerings: ['Coffee', 'Desserts', 'Shisha'],
  instagram: '@pistachio.ghana',
  instagramUrl: 'https://instagram.com/pistachio.ghana',
};

// --- Hours ------------------------------------------------------------------
// Weekdays Mon–Fri, weekends Sat–Sun. Times are local Accra (UTC+0, no DST).

export const HOURS = {
  weekday: { open: '08:00', close: '23:00' }, // 8AM – 11PM
  weekend: { open: '08:00', close: '00:00' }, // 8AM – 12AM
};

// --- Contact ----------------------------------------------------------------
// Phone, WhatsApp, street address and email are NOT yet confirmed by the owner.
// TODO: confirm these with the owner and replace the placeholders below.
export const CONTACT = {
  // TODO: confirmed phone number (e.g. '+233 00 000 0000')
  phone: 'TODO: +233 00 000 0000',
  // TODO: confirmed WhatsApp number in international format, e.g. '233XXXXXXXXX'
  whatsapp: 'TODO: 233000000000',
  // TODO: confirmed street address, e.g. 'Spintex Road, Accra'
  address: 'TODO: Spintex, Accra, Ghana',
  // TODO: confirmed contact email, e.g. 'hello@pistachio.cafe'
  email: 'TODO: hello@pistachio.cafe',
};

// --- Currency ---------------------------------------------------------------
// Products are stored in Ghana cedis (GHS). Paystack wants the amount in
// pesewas (kobo), so multiply by 100 when talking to Paystack.
export const CURRENCY = 'GHS';
export const CURRENCY_SYMBOL = '₵';
export const TO_PAYSTACK = (cedis) => Math.round(Number(cedis || 0) * 100);
export const FROM_PAYSTACK = (pesewas) => Number(pesewas || 0) / 100;

// --- Payment ----------------------------------------------------------------
// Public key is safe to ship to the browser. The secret key lives ONLY in
// Supabase function secrets — never here, never prefixed with VITE_.
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

// --- Image paths ------------------------------------------------------------
// Brand images in /public are temporary placeholders and will be swapped
// one by one later. Reference every image from here so swaps are one-liners.
// TODO: replace each placeholder path with the final asset once it exists.
export const IMAGES = {
  logo: '/images/brand/logo.svg',
  logoPng: '/images/brand/logo.png',
  // TODO: final hero image
  hero: '/images/hero-flatlay.jpg',
  heroCoffee: '/images/hero-coffee-beans.jpg',
  // TODO: final about image
  about: '/images/about-marble-bag.jpg',
  // TODO: final menu / category imagery
  menu: '/images/menu-marble-closeup.jpg',
  poster: '/images/poster-three-cups-wide.jpg',
  // Generic product placeholder when a product has no image_url.
  // TODO: final placeholder asset
  placeholder: '/images/placeholder-cup-pistachios.jpg',
};

// --- Order code -------------------------------------------------------------
// Human-friendly prefix for new order codes.
export const ORDER_CODE_PREFIX = 'PSC';

// --- Tracking stepper -------------------------------------------------------
// Order statuses shown to customers, in chronological order.
export const TRACK_STATUSES = ['received', 'preparing', 'ready', 'completed'];
export const TRACK_STATUS_LABELS = {
  received: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
};
// 'out for delivery' is a valid status the kitchen may set; keep it in the
// display order but show it between ready and completed.
export const TRACK_STATUS_LABELS_EXTRA = {
  'out for delivery': 'Out for delivery',
};