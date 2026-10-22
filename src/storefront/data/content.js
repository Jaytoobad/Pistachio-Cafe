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

// Home "about" teaser.
export const HOME_ABOUT_TEASER = {
  eyebrow: 'A neighbourhood table, done with care',
  heading: 'A neighbourhood table, done with care',
  body: 'Breakfast, brunch, coffee and something sweet, made in our kitchen in Spintex.',
  body2: 'Order ahead for pickup, or have it delivered anywhere we cover in Accra.',
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

// --- Starter reviews (sample data) ------------------------------------------
// These three reviews are SAMPLE/INVENTED. They render only in demo mode -
// i.e. when no approved reviews exist yet. Label them as "sample" in code
// comments; never present them as real customer feedback.

export const STARTER_REVIEWS = [
  {
    name: 'Ama Owusu',
    role: 'Regular, Saturday brunch',
    rating: 5,
    quote: 'The shakshuka is unreal and the staff remember my order. My weekend does not start without this place.',
    sample: true,
  },
  {
    name: 'Kwabena Asante',
    role: 'First-time visitor',
    rating: 5,
    quote: 'Walked in for coffee, stayed two hours for the brunch board. Genuinely one of the best in the city.',
    sample: true,
  },
  {
    name: 'Linda Mensah',
    role: 'Works nearby',
    rating: 4,
    quote: 'My go-to for a working lunch. Would love a few more vegan dessert options, but the coffee alone keeps me coming back.',
    sample: true,
  },
];
