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
  // PLACEHOLDER: replace with real info — Facebook, X and TikTok have no
  // confirmed URLs yet. Keep them empty so components hide the icons.
  facebookUrl: '',
  xUrl: '',
  tiktokUrl: '',
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
  // Street address — the neighbourhood is confirmed.
  address: 'Spintex, Accra, Ghana',
  // Google Maps search link. Clicking it opens the Maps app / web view
  // centred on the café's neighbourhood.
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pistachio+Cafe+Spintex+Accra',
};

// --- Contact visibility -----------------------------------------------------
// Phone/WhatsApp are placeholders until the owner confirms real digits.
// A value is treated as a placeholder when it is empty or looks like
// 00 000 0000 (digits-only check so both '+233 00 000 0000' and
// '233000000000' are caught). Components must gate on HAS_PHONE /
// HAS_WHATSAPP so nothing renders (links, tel:, wa:, buttons) until real
// values are placed in CONTACT above.

const PLACEHOLDER_DIGITS = '0000000000';

export function isPlaceholderContact(value) {
  if (!value) return true;
  const v = String(value);
  const digits = v.replace(/[^0-9]/g, "");
  if (!digits) return true;
  if (digits === "233000000000") return true;
  if (/^0+$/.test(digits)) return true;
  if (digits.includes("0000000000")) return true;
  return false;
}

export const HAS_PHONE = !isPlaceholderContact(CONTACT.phone);
export const HAS_WHATSAPP = !isPlaceholderContact(CONTACT.whatsapp);
export const HAS_EMAIL = !(isPlaceholderContact(CONTACT.email) || CONTACT.email === 'hello@pistachio.cafe');

// --- Social visibility -------------------------------------------------------
// Facebook / X / TikTok have no confirmed URLs yet, so they default to
// empty and the icons are hidden until a real link is set here.
export const HAS_FACEBOOK = Boolean(BRAND.facebookUrl);
export const HAS_X = Boolean(BRAND.xUrl);
export const HAS_TIKTOK = Boolean(BRAND.tiktokUrl);

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
  // TODO: final menu imagery
  menu: '/images/menu-marble-closeup.jpg',
  poster: '/images/poster-three-cups-wide.jpg',
  // Generic dish placeholder when a dish has no image_url.
  // TODO: final placeholder asset
  placeholder: '/images/placeholder-cup-pistachios.jpg',
};

// --- Order code -------------------------------------------------------------
// Human-friendly prefix for new order codes. Format: PI-123456.
export const ORDER_CODE_PREFIX = 'PI';

// --- Tracking stepper -------------------------------------------------------
// Order statuses shown to customers, in chronological order. The full server
// lifecycle is: received, confirmed, preparing, ready, out_for_delivery,
// delivered, completed, cancelled. The stepper only shows the customer-facing
// subset (cancelled is rendered by StatusPill instead).
export const TRACK_STATUSES = ['received', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed'];
export const TRACK_STATUS_LABELS = {
  received: 'Received',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  completed: 'Completed',
};

// --- Delivery promise -------------------------------------------------------
// Realistic window customers can rely on. Displayed on the home page.
export const DELIVERY_PROMISE = {
  pickup: 20, // minutes
  delivery: 45, // minutes
};

// --- Delivery zones ---------------------------------------------------------
// Delivery fee comes from the SELECTED zone, not a flat rate. The default
// zone (Spintex) is GHS 15. Zones are keyed by id; checkout/cart should ask
// the customer to pick one when delivery is selected.
export const DELIVERY_ZONES = [
  { id: 'spintex',       name: 'Spintex',            fee: 15, default: true },
  { id: 'airport-res',   name: 'Airport Residential', fee: 20 },
  { id: 'east-legon',    name: 'East Legon',          fee: 25 },
  { id: 'cantonments',   name: 'Cantonments',         fee: 25 },
  { id: 'labadi',        name: 'Labadi',              fee: 30 },
];

export const DEFAULT_DELIVERY_ZONE =
  DELIVERY_ZONES.find((z) => z.default) || DELIVERY_ZONES[0];

export function getDeliveryZone(id) {
  return DELIVERY_ZONES.find((z) => z.id === id) || DEFAULT_DELIVERY_ZONE;
}
export function getContact() {
  const c = { ...CONTACT };
  if (isPlaceholderContact(c.phone)) c.phone = null;
  if (isPlaceholderContact(c.whatsapp)) c.whatsapp = null;
  if (isPlaceholderContact(c.email) || c.email === 'hello@pistachio.cafe') c.email = null;
  return c;
}
