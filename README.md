# ECommerce UI — React.js

Storefront and admin UI for the `ECommerce-API-Node.js-NestJS` backend.
**It is not connected to the backend yet**: all data comes from `src/data/mockData.js`,
and actions (cart, orders, admin CRUD) are simulated in memory.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Pages

| Route | Page |
| --- | --- |
| `/` | Home (hero, categories, new arrivals) |
| `/products`, `/categories/:slug` | Product list — search, category, price and stock filters, sorting |
| `/products/:id` | Product detail |
| `/cart` | Cart (plus a slide-out cart drawer on every page) |
| `/checkout` | Checkout (sign-in required) |
| `/orders`, `/orders/:id` | My orders, order detail (pay / cancel) |
| `/login`, `/register`, `/account` | Auth and account |
| `/admin` | Admin panel: overview, products, categories, orders (ship) |

**Demo sign-in:** any email + a password of at least 6 characters. If the email contains
`admin` (e.g. `admin@example.com`) you sign in with the admin role.

## Folder structure

```
src/
  components/      Shared components (ProductCard, ui.jsx, layout/)
  context/         DataContext (mock database), Auth, Cart, Toast
  data/            mockData.js — same fields as the backend entities
  pages/           Store pages and admin/
  styles/          global (tokens), components, pages, admin
  utils/format.js  Currency/date formatting, OrderStatus labels
```

## Connecting to the backend

The functions in `DataContext`, `AuthContext` and `CartContext` are named to match the NestJS endpoints:

| Context function | Backend endpoint |
| --- | --- |
| `login` / `register` | `POST /auth/login`, `POST /auth/register` |
| `products`, `createProduct`, `updateProduct`, `removeProduct` | `GET/POST /products`, `PATCH/DELETE /products/:id` |
| `categories`, `createCategory`, ... | `/categories` |
| `addItem`, `updateItem`, `removeItem` | `POST /cart/items`, `PATCH/DELETE /cart/items/:id` |
| `createOrder` | `POST /orders` |
| `setOrderStatus(id, 'paid' / 'cancelled' / 'shipped')` | `POST /orders/:id/pay`, `POST /orders/:id/cancel`, `PATCH /orders/:id/ship` |

The Product entity has no image field, so `ProductImage` renders a category-tinted placeholder;
if you add an `imageUrl` to the backend, only that component needs to change.
