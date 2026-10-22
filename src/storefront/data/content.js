// ============================================================================
// storefront/data/content.js - ALL page copy specific to Pistachio Cafe.
//
// Brand facts that are confirmed (location, hours, delivery zones,
// Instagram) live in storefront/config.js and are NOT duplicated here.
//
// Every value in this file is customer facing: never put an owner note, a
// TODO or the word PLACEHOLDER in a value. Owner notes belong in comments.
// ============================================================================

// --- Home -------------------------------------------------------------------

// Hero strip location line.
export const HERO_LOCATION = 'Spintex, Accra, Ghana';

// Hero strip hours line. The times themselves come from config.HOURS; this is
// the wording shown on the page.
export const HERO_HOURS_TEXT = 'Mon\u2013Fri 8AM\u201311PM \u00b7 Sat\u2013Sun 8AM\u201312AM';

// The hero. The headline is sentence case on purpose - no capital blocks.
export const HOME_HERO = {
  headline: 'Breakfast, brunch and the good kind of slow.',
  subline: 'Coffee, desserts and shisha, made in our kitchen in Spintex, Accra.',
};

// The "Our menu" section: one tile per menu section.
export const HOME_MENU = {
  heading: 'Our menu',
  intro: 'Four sections, one kitchen. Pick a section and order online for pickup or delivery.',
};

// The "Customer favourites" section: the dishes the owner marks as featured.
export const HOME_FAVOURITES = {
  heading: 'Customer favourites',
};

// The "Our story" section. Plain copy - nothing here that we cannot stand
// behind, and no filler.
export const HOME_STORY = {
  heading: 'Our story',
  body: 'Pistachio is a cafe in Spintex, Accra. We serve coffee, desserts and shisha, and we host evenings such as paint and sip. Order online for pickup or delivery, or come and sit with us.',
  button: 'Read our story',
};

// The reviews section. Only approved reviews are shown; the form is always
// there so a guest can leave one.
export const HOME_REVIEWS = {
  heading: 'Reviews',
  formHeading: 'Tell us how we did',
  formIntro: 'Tell us what you loved, or what we could do better.',
  nameLabel: 'Your name',
  ratingLabel: 'Rating',
  reviewLabel: 'Your review',
  submit: 'Send review',
  sending: 'Sending',
  success: 'Thanks for the review.',
  missing: 'Please add your name, a rating and a short review.',
  error: 'We could not send your review just now. Please try again.',
};

// The "Visit us" section.
export const HOME_VISIT = {
  heading: 'Visit us',
  addressHeading: 'Where we are',
  hoursHeading: 'When we are open',
  directions: 'Get directions',
  instagram: 'Instagram',
};

// --- About ------------------------------------------------------------------

export const ABOUT_HERO = {
  eyebrow: 'Our story',
  heading: 'Slow food, made by people who care about the details',
  body: 'Pistachio is a neighbourhood kitchen in Spintex, Accra. We cook breakfast, brunch, coffee and desserts through the day, and we stay open late at the weekend.',
};

// The story card under the about hero.
export const ABOUT_STORY = {
  title: 'A neighbourhood table, done with care',
  body: 'Pistachio is a neighbourhood kitchen in Spintex. Breakfast, brunch, coffee and desserts all come out of one kitchen, and we keep the doors open late at the weekend so the table keeps going.',
  body2: 'Most plates are cooked to order, so a breakfast takes a few minutes longer than a takeaway. Order ahead and we will have it ready when you arrive.',
};

// The four numbers on the about page. They repeat the opening hours and the
// delivery zones, so they stay true when the owner edits config.HOURS or
// config.DELIVERY_ZONES.
export const ABOUT_STATS = [
  { value: '8AM',  label: 'kitchen opens, Monday to Friday' },
  { value: '11PM', label: 'kitchen closes on a weekday' },
  { value: '12AM', label: 'kitchen closes at the weekend' },
  { value: '5',     label: 'delivery zones across Accra' },
];

export const ABOUT_FAQ_DELIVERY = 'We deliver across Spintex and the surrounding Accra areas. Enter your address at checkout to see the fee and the time for your zone.';

// --- Footer ------------------------------------------------------------------
// The two short lines printed under the footer logo.
export const FOOTER_LINES = [
  'Breakfast, brunch and desserts, made fresh each day.',
  'Pickup in Spintex or delivery across Accra.',
];

// --- Contact ----------------------------------------------------------------

export const CONTACT_INTRO = 'Questions about an order, a large order or a booking? We are in Spintex, Accra, and we are glad to help.';

// --- Delivery info ----------------------------------------------------------

export const DELIVERY_ZONES_TEXT = 'We deliver within Spintex and the surrounding Accra areas. The fee and the time shown at checkout come from the zone you pick.';

// There are no sample reviews. The storefront shows approved reviews from the
// database and nothing else - never invented quotes.
