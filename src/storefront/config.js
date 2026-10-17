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
// Phone, WhatsApp and email are placeholders until the owner confirms them.
// The WhatsApp number is the raw international digits (no +, no spaces) so it
// can be dropped straight into a https://wa.me/<digits> link.
export const CONTACT = {
  phone: '+233 00 000 0000',
  whatsapp: '233000000000',
  email: 'hello@pistachio.cafe',
  // Street address is a placeholder too — the neighbourhood is confirmed.
  address: 'Spintex Road, Accra',
  // Google Maps search link. Clicking it opens the Maps app / web view
  // centred on the café's neighbourhood.
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pistachio+Cafe+Spintex+Accra',
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

// --- Delivery promise -------------------------------------------------------
// Realistic window customers can rely on. Displayed on the home page.
export const DELIVERY_PROMISE = {
  pickup: 20, // minutes
  delivery: 45, // minutes
};