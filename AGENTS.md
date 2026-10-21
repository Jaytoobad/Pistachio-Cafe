# Project rules

Pistachio Cafe (Spintex, Accra) — customer storefront plus staff admin.
Stack: React 18, Vite, React Router, Supabase, Paystack, plain CSS (no CSS framework).

## Encoding

- Every file is UTF-8 **without BOM**. Do not add a BOM to anything.
- In JSX write punctuation as HTML entities: `&ndash;` `&mdash;` `&middot;` `&copy;` `&rsaquo;` `&lsaquo;`.
- In JS strings use `\u` escapes (for example `\u2014` for an em dash).
- Never paste special characters straight into a file. Never paste emoji.
- No emoji anywhere in code, copy or UI.
- Icons are inline SVG with explicit `width` and `height` attributes.
- Stars (ratings) are SVG, never text characters.

## Verification

- Never say a UI change is done until `npm run verify` passes.
- `npm run verify` writes full-page screenshots to `docs/screens/`. Look at them.
- If you cannot view images, say so explicitly and rely on the printed report
  instead of claiming you saw the screens.

## Design

- Keep the existing colour palette (`src/styles/tokens.css`, `src/styles/variables.css`).
  Do not introduce new brand colours.
- Headings are sentence case and left aligned.
- No ALL-CAPS section titles with underlines.
- No numbered badges unless the content is a real sequence.
- No arrows added to button text.
- No emoji.
- No hover or fade effect on everything. Use them only where they carry meaning.
- Do not repeat the same rounded card with the same shadow everywhere.
- No fake content. Real dishes, real hours, real prices, real photos.
- Copy is plain, specific and warm.
- Buttons say what happens: "Add to cart", "Track my order". Not "Submit", "Click here".

## Content

- Never render notes, TODOs or the word PLACEHOLDER to customers.
- All owner-editable text lives in `src/storefront/data/content.js` and
  `src/storefront/config.js`. Do not hard-code copy inside components.

## Responsive

- Design phone first: 360 to 430 px. Then tablet: 768 to 1024 px. Then desktop.
- No horizontal scroll at any width.
- Tap targets are at least 44 px.

## Database

- Database changes are NOT allowed.
- The live schema is documented in `docs/SCHEMA.md`. Read it before touching data code.
