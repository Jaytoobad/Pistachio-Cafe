# Pistachio Café — Architecture

React 18 + Vite single-page app. One SPA serves both the customer-facing
storefront and the internal admin panel, lazy-loaded by route.

## Folder layout

```
src/
├── main.jsx                 # Entry: ReactDOM root, BrowserRouter, global CSS
├── App.jsx                  # Route map + top-level providers
├── lib/                     # Shared (both surfaces)
│   ├── supabase.js          # Single Supabase client (null in demo mode)
│   ├── format.js            # Money / date / slug helpers
│   ├── context/
│   │   ├── AuthContext.jsx      # Auth session + staff check
│   │   └── ToastContext.jsx     # Global toast notifications
│   └── components/
│       ├── PageLoader.jsx, NotAuthorized.jsx, ConfirmDialog.jsx,
│       ├── PasswordInput.jsx, StatusPill.jsx, ProtectedAdminRoute.jsx
├── admin/                   # Internal admin panel
│   ├── layout/AdminLayout.jsx, Sidebar.jsx, MobileTabBar.jsx
│   └── pages/ Dashboard, Login, Orders, OrderDetail, MenuSections,
│               Reviews, Subscribers, Settings, Staff
│   └── services/admin.js     # All admin Supabase queries
├── storefront/              # Customer-facing site
│   ├── config.js            # Brand, hours, contact, currency, images
│   ├── storefront.css
│   ├── context/CartContext.jsx, SettingsContext.jsx
│   ├── components/ DishCard, QuantityStepper, ReviewCard, SectionHeading,
│   │              StarRating, Stepper, StorefrontLayout
│   ├── pages/ Home, Menu, Cart, Checkout, Track, About, Reviews, Contact,
│   │           policy/{DeliveryInfo,Privacy,Terms}, NotFound
│   └── services/ dishes, orders, reviews, newsletter, tracking
└── styles/                  # index.css + tokens.css + variables.css
```

## Routes

| Path                    | Surface     | Component            |
|-------------------------|-------------|----------------------|
| `/`                     | Storefront  | Home                 |
| `/menu`                 | Storefront  | Menu                 |
| `/cart`                 | Storefront  | Cart                 |
| `/checkout`             | Storefront  | Checkout             |
| `/track`, `/track/:code`| Storefront  | Track                |
| `/about`, `/reviews`, `/contact` | Storefront | About/Reviews/Contact |
| `/admin/login`          | Admin       | Login                |
| `/admin` (index)        | Admin       | Dashboard            |
| `/admin/orders`, `/:id` | Admin       | Orders / OrderDetail |
| `/admin/menu`           | Admin       | MenuSections         |
| `/admin/reviews`        | Admin       | Reviews              |
| `/admin/subscribers`    | Admin       | Subscribers          |
| `/admin/settings`       | Admin       | Settings             |
| `/admin/staff`          | Admin       | Staff                |

Admin routes are wrapped in `ProtectedAdminRoute` (requires an authenticated
Supabase account with a row in `staff`). The storefront renders inside
`StorefrontLayout`, itself nested in `SettingsProvider`.

## Data flow

- **Supabase client** — `src/lib/supabase.js` is the only client. It reads
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` and exports `null` when
  unset, so the app renders in demo mode. Every service must check
  `isSupabaseConfigured` before querying.
- **Admin writes** — `src/admin/services/admin.js` is the single write layer
  for orders, menu, dishes, reviews, subscribers, settings, and staff.
- **Storefront reads** — `src/storefront/services/*` read from Supabase;
  `dishes.js` re-exports `fetchMenu`/`fetchDishes` from the admin service to
  avoid duplicating query logic.
- **Payments** — Paystack public key is a `VITE_` env var (browser-safe).
  The secret key lives only in Supabase Edge Function secrets. Amounts are
  stored in GHS; `config.js` converts to pesewas for Paystack.
- **Edge functions** — `create-order`, `paystack-webhook`, `verify-payment`
  run server-side (see `supabase/functions/`).

## State / context

- `AuthContext` — session + `isStaff` flag, consumed by `ProtectedAdminRoute`.
- `CartContext` — cart items, totals, open/close state.
- `SettingsContext` — site settings loaded from the `settings` table,
  consumed by the storefront layout.
- `ToastContext` — global toast queue, wraps everything.

## Build & env

- `npm run build` — production build (verified passing).
- `.env` needs `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
- Supabase secrets (set via `supabase secrets set`): `PAYSTACK_SECRET_KEY`,
  `SUPABASE_URL`, `SERVICE_ROLE_KEY`.