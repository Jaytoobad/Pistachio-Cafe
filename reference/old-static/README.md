# Pistachio Café — website

A 5-page cafe website: Home, Shop, Cart, Checkout (with Paystack + order
tracking), and About. Plain HTML/CSS/JS — no build step, no framework.

## Files

```
index.html          Homepage (hero, featured menu, about teaser, reviews)
shop.html            Full menu with category filters
cart.html            Cart page
checkout.html        Payment (Paystack) + order tracking
about.html           Goals, achievements, core values, FAQ
css/style.css        All styles (design tokens at the top)
js/products.js       <-- EDIT THIS to add your real menu items
js/cart.js           Shared cart logic (localStorage-based)
js/main.js           Nav toggle, reviews, newsletter
js/shop.js           Renders the shop grid + filters
js/cart-page.js       Renders the cart page
js/checkout.js       Paystack integration + order tracking
images/               Drop your own photos here
```

## Add your own images

The site looks for these files. Anywhere an image is missing, the page
shows a small placeholder label instead of a broken image, so nothing
looks broken while you're filling things in.

- `images/hero-bg.jpg` — homepage hero background. Set it in
  `css/style.css` under the `.hero` rule (`background-image`).
- `images/about-cafe.jpg`, `images/about-team.jpg` — used on the
  homepage and about page.
- `images/products/*.jpg` — one per menu item, referenced by the
  `image` field in `js/products.js`.

## Add your menu

Open `js/products.js` and edit the `PRODUCTS` array — each item is a
plain object with `id`, `name`, `category`, `price`, `desc`, and
`image`. The shop page, homepage "featured" section, and cart all read
from this one file, so you only ever edit it in one place.

## Set up Paystack payments

1. Create a free account at paystack.com and copy your **public** key.
2. Paste it into `PAYSTACK_PUBLIC_KEY` at the top of `js/checkout.js`.
3. Until you do, the checkout page runs in demo mode: it simulates a
   successful payment so you can see the full order-tracking flow.
4. Important: verify payments on your **server** using your secret key
   (or a webhook) before treating an order as paid. A page-only check
   can be spoofed — see the comment block at the top of
   `js/checkout.js` for details.

## Order tracking — how far this goes out of the box

The tracker on the checkout page is a front-end demo: it advances
automatically on a timer so you can see the "Received → Preparing →
Ready → Completed" flow. For real tracking tied to your kitchen, you'll
want a small backend (or a service like Firebase/Supabase) that staff
update, and swap the `simulateProgress()` function in `js/checkout.js`
for a call that reads real status from that backend.

## Reviews

Homepage reviews store what a visitor submits in `localStorage`, so
it's visible to them on that device only — not to other visitors. To
show everyone's reviews, connect the form in `js/main.js` to a backend
or a form service (Formspree, Airtable, Supabase, etc).

## Ideas for what to add next

- Swap `localStorage` cart/orders for a real backend once you have one,
  so carts and orders aren't tied to a single browser.
- Add an admin view for staff to update order status and see incoming
  orders.
- Add structured data (schema.org `Restaurant`/`Menu`) for richer
  Google search results.
- Add a loyalty points counter tied to customer accounts.
- Connect the newsletter form to an email tool (Mailchimp, Brevo, etc).

## Run it locally

Just open `index.html` in a browser. No install or build step needed.

## Put it online (free options)

Because `index.html` is at the repo root, you can host this directly:

- **GitHub Pages**: repo Settings > Pages > Deploy from branch > `main` / `(root)`.
- **Netlify or Vercel**: import the repo; leave the build command empty and
  the publish directory as the root.

Paystack's popup needs the site served over HTTPS, which all of the above provide.
