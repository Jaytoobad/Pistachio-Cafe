// ============================================================================
// storefront/data/content.js — ALL page copy specific to Pistachio Café.
//
// Every block below is marked with a comment "PLACEHOLDER: replace with real
// info" so the owner can find and swap out the invented copy at a glance.
// Brand facts that are confirmed (location, hours, Instagram) live in
// storefront/config.js and are NOT duplicated here.
// ============================================================================

// --- Home -------------------------------------------------------------------

// PLACEHOLDER: replace with real info — hero strip location line.
export const HERO_LOCATION = 'Spintex, Accra, Ghana';

// PLACEHOLDER: replace with real info — hero strip hours line. Hours themselves
// come from config.HOURS; this is just the human wording used in the strip.
export const HERO_HOURS_TEXT = 'Mon–Fri 8AM–11PM · Sat–Sun 8AM–12AM';

// PLACEHOLDER: replace with real info — home "about" teaser body. The origin
// story below (single espresso cart → full kitchen) is invented until the
// owner supplies the real one.
export const HOME_ABOUT_TEASER = {
  eyebrow: 'A neighbourhood table, done with care',
  heading: 'A neighbourhood table, done with care',
  body: 'PLACEHOLDER: replace with real info — invented origin story. Pistachio started as a single espresso cart and grew into a full kitchen — but the goal never changed: make people feel properly looked after over a good plate of food.',
  body2: 'PLACEHOLDER: replace with real info — invented. We bake daily, source from growers we know by name, and treat every table — regulars and first-timers alike — like they\'re the reason we opened the doors.',
};

// --- About ------------------------------------------------------------------

// PLACEHOLDER: replace with real info — page hero origin story. The "slow
// food, made by people who care about the details" framing is invented.
export const ABOUT_HERO = {
  eyebrow: 'Our story',
  heading: 'Slow food, made by people who care about the details',
  body: 'PLACEHOLDER: replace with real info — the origin story is invented. Tell the real story of how Pistachio started and what drives it today.',
};

// PLACEHOLDER: replace with real info — the four stat numbers. All four
// (6 years / 40k+ plates / 12 farms / 4.8★) are invented.
export const ABOUT_STATS = [
  { value: '6',     label: 'years serving the neighbourhood',  note: 'PLACEHOLDER: replace with real info — invented' },
  { value: '40k+',  label: 'plates served last year',          note: 'PLACEHOLDER: replace with real info — invented' },
  { value: '12',    label: 'local farms & roasters we work with', note: 'PLACEHOLDER: replace with real info — invented' },
  { value: '4.8★',  label: 'average customer rating',           note: 'PLACEHOLDER: replace with real info — invented' },
];

// PLACEHOLDER: replace with real info — FAQ delivery-area answer. Must match
// the Spintex delivery area (see config.DELIVERY_ZONES).
export const ABOUT_FAQ_DELIVERY = 'PLACEHOLDER: replace with real info — we deliver within Spintex and surrounding Accra areas. Enter your address at checkout and we\'ll let you know if you\'re in range.';

// --- Contact ----------------------------------------------------------------

// PLACEHOLDER: replace with real info — contact page intro paragraph.
export const CONTACT_INTRO = 'PLACEHOLDER: replace with real info — reach out with questions about orders, events, or anything else. We are in Spintex, Accra, Ghana and happy to help.';

// PLACEHOLDER: replace with real info — email is a placeholder until a real
// address is set in config.CONTACT. Components must hide it until then.
export const CONTACT_EMAIL_PLACEHOLDER_NOTE = 'PLACEHOLDER: replace with real info — confirm this email with the owner.';

// --- Delivery info ----------------------------------------------------------

// PLACEHOLDER: replace with real info — delivery zones paragraph. Must match
// the Spintex delivery area (see config.DELIVERY_ZONES).
export const DELIVERY_ZONES_TEXT = 'PLACEHOLDER: replace with real info — we deliver within Spintex and surrounding Accra areas. Exact coverage and fees are set in the admin panel.';

// --- Starter reviews (sample data) ------------------------------------------
// These three reviews are SAMPLE/INVENTED. They render only in demo mode —
// i.e. when no approved reviews exist yet. Label them as "sample" in code
// comments; never present them as real customer feedback.

// PLACEHOLDER: replace with real info — sample reviews for demo mode only.
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