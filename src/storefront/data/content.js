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
  eventsButton: 'Explore cafe events',
};

// The steam video band: a short line about the cafe next to the steaming cup.
export const HOME_STEAM_VIDEO = {
  heading: 'Pistachio Caf\u00e9',
  body: 'Coffee, desserts and shisha in Spintex, Accra. Order online for pickup or delivery, or come and sit with us.',
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
  body: 'At Pistachio Cafe, a good day can begin with a cup of coffee and breakfast, turn into a long brunch, or find its sweet finish with dessert. Our cafe in Spintex brings these moments together in one welcoming neighbourhood spot.',
  body2: 'Coffee, breakfast, brunch, desserts and shisha each have their place on the menu. Whether you are stopping in for a quick pick-up or settling in with friends, we want your visit to feel relaxed and thoughtfully made.',
  body3: 'Most of our plates are prepared to order. That can mean a little extra time at the table, and it is part of serving food fresh. If you are on the way, order ahead for pickup or choose delivery across Accra.',
  body4: 'When the weekend arrives, we keep the doors open later. We also host paint-and-sip evenings and other get-togethers, giving the neighbourhood another reason to share a table. At every hour, our aim is simple: good food, warm service and a cup worth coming back for.',
};

export const EVENTS_PAGE = {
  eyebrow: 'Gather at Pistachio',
  heading: 'Good food, good company, a little something extra',
  intro: 'We host paint-and-sip evenings and other get-togethers at our cafe in Spintex. New dates and booking details will be shared here and on Instagram.',
  emptyHeading: 'No upcoming dates just yet',
  emptyBody: 'Follow us on Instagram to hear when the next evening is planned.',
  instagramLabel: 'Follow us on Instagram',
  visitLabel: 'Plan your visit',
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

export const TRACK_ORDER_PAGE = {
  eyebrow: 'A little update from our kitchen',
  heading: 'Track your order',
  intro: 'Enter the order code from your confirmation and the phone number used at checkout.',
  codeLabel: 'Order code',
  phoneLabel: 'Phone number',
  codePlaceholder: 'e.g. PI-123456',
  phonePlaceholder: 'The number used at checkout',
  submit: 'Track my order',
  codeHint: 'Your order code is in your confirmation message.',
  privacyNote: 'Your phone number helps us find the right order.',
  refresh: 'Refresh status',
  refreshing: 'Checking for updates',
  checking: 'Checking for the latest order update...',
  autoRefresh: 'Updates automatically every 12 seconds',
  nextHeading: 'What happens next',
  tryAgain: 'Try again',
  lookupError: 'Could not look up this order. Try again.',
  refreshError: 'We could not refresh your order. Please try again.',
  checkErrorHeading: 'We could not check this order',
  notFoundHeading: 'Order not found',
  lastChecked: 'Last checked',
  notFound: 'We could not find that order. Check the code and phone number from your confirmation, then try again.',
  guidance: {
    received: 'We have received your order. The cafe team will confirm it shortly.',
    confirmed: 'Your order is confirmed. Our team is getting it ready.',
    preparing: 'The kitchen is preparing your order fresh.',
    readyPickup: 'Your order is ready for pickup at the cafe.',
    readyDelivery: 'Your order is ready. Our team is arranging the delivery.',
    outForDelivery: 'Your order is on its way to you.',
    delivered: 'Your order has been delivered. We hope you enjoy it.',
    completed: 'Your order is complete. Thanks for choosing Pistachio Cafe.',
    cancelled: 'This order was cancelled. Contact the cafe if you need help.',
    default: 'We are keeping an eye on your order. Check back for the next update.',
  },
};

// There are no sample reviews. The storefront shows approved reviews from the
// database and nothing else - never invented quotes.
