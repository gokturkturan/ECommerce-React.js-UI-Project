# E-Commerce UI — React

Storefront and admin panel for the [E-Commerce API (NestJS)](https://github.com/gokturkturan/ECommerce-API-Node.js-NestJS). Every page works against the real backend: browsing, cart, checkout, order tracking and admin management all go through its REST API.

The focus is a clean data layer: one RTK Query API slice with cache invalidation, silent access-token refresh, session restore after a page reload, and role-based route guards.

![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?logo=redux&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_7-CA4245?logo=reactrouter&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

---

## Features

### Storefront
- **Product catalogue** with search, category pages, price range and in-stock filters, and sorting. Filtering and sorting run **on the server**, and every filter lives in the URL, so results can be shared and survive a reload.
- **Product detail** pages and a slide-out **cart drawer** available on every page
- **Server-side cart**: the cart is stored by the backend, so it follows the user across devices
- **Checkout** with a shipping-address form and an optional "pay now" step
- **Order history and order detail** with a status timeline (pending → paid → shipped), plus pay and cancel actions for pending orders
- Register, login, logout and an account page

### Admin panel (`/admin`, admin role only)
- **Dashboard** with revenue, orders waiting to ship, pending orders and recent orders
- **Product and category management** (create, edit, delete)
- **Order management** with status filters and a "mark as shipped" action

## Tech stack

| Area | Technology |
| --- | --- |
| UI | React 19, plain CSS with design tokens, lucide-react icons |
| State and data fetching | Redux Toolkit, RTK Query |
| Routing | React Router 7 |
| Build | Vite |
| Backend | [NestJS REST API](https://github.com/gokturkturan/ECommerce-API-Node.js-NestJS) (PostgreSQL, RabbitMQ) |

## How it works

### Data layer
All server communication lives in a single RTK Query API slice (`src/store/api.js`) with about 25 endpoints. Queries *provide* cache tags (`Products`, `Categories`, `Cart`, `Orders`) and mutations *invalidate* them. Data on screen therefore refreshes automatically after a change: placing an order, for example, refetches both the cart and the order list, with no manual state syncing.

### Authentication
- **Silent token refresh.** Every request carries the access token. If the API answers `401`, the base query calls `/auth/refresh` with the stored refresh token, saves the new token pair and retries the original request once. If the refresh fails, the session is cleared.
- **Session restore.** After a page reload only the tokens are known. `AuthBootstrap` loads `/users/me` once and holds rendering until it resolves, so protected pages don't briefly redirect to the login page.
- **Route guards.** `RequireAuth` protects checkout, orders and account; `RequireAuth role="admin"` protects the whole admin area. Guests who try to add to the cart are sent to the login page and come back afterwards.

### Project structure

```
src/
├── components/        # ProductCard, ProductImage, shared UI, route guard, auth bootstrap
│   └── layout/        # Store and admin layouts, header, footer, cart drawer
├── context/           # Toast notifications
├── hooks/             # useAuth
├── pages/             # Storefront pages
│   └── admin/         # Dashboard, products, categories, orders
├── store/             # Redux store, RTK Query API slice, auth and UI slices
├── styles/            # Design tokens, components, pages, admin
└── utils/             # Price and date formatting
```

## Routes

| Route | Page | Access |
| --- | --- | --- |
| `/` | Home | Public |
| `/products`, `/categories/:slug` | Product list with filters | Public |
| `/products/:id` | Product detail | Public |
| `/cart` | Cart | Public (shows contents when signed in) |
| `/login`, `/register` | Authentication | Public |
| `/checkout` | Checkout | Signed in |
| `/orders`, `/orders/:id` | Order history and detail | Signed in |
| `/account` | Account | Signed in |
| `/admin/*` | Dashboard, products, categories, orders | Admin |

## Getting started

**Prerequisites:** Node.js 20+ and the [backend](https://github.com/gokturkturan/ECommerce-API-Node.js-NestJS) running locally.

```bash
# 1. Start the backend first (see its README), by default on http://localhost:3000

# 2. Install dependencies
npm install

# 3. Point the UI to the API
cp .env.example .env        # VITE_API_URL=http://localhost:3000

# 4. Start the dev server (http://localhost:5173)
npm run dev
```

To use the admin panel, promote a user to `admin` as described in the backend README, then log in again.

## Roadmap

- **Single-flight token refresh:** when several requests get a `401` at the same moment, let only one of them call `/auth/refresh` and have the others wait for it. With refresh-token rotation, a second parallel refresh is rejected and currently signs the user out.
- **Refresh token in an httpOnly cookie** instead of `localStorage`, to reduce exposure to XSS
- Shipping fee calculated by the backend, so the checkout total and the order total always match
- Pagination for product and order lists
- Component and end-to-end tests (Vitest, React Testing Library, Playwright)

## Author

**Göktürk Turan** · Backend Developer · [gokturkturan.com](https://gokturkturan.com) · [LinkedIn](https://www.linkedin.com/in/gokturkturan/)
