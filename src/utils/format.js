const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const date = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateTime = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatPrice = (value) => currency.format(Number(value) || 0);
export const formatDate = (iso) => date.format(new Date(iso));
export const formatDateTime = (iso) => dateTime.format(new Date(iso));

/** Matches the backend OrderStatus enum one-to-one */
export const ORDER_STATUS = {
  pending: { label: 'Awaiting payment', tone: 'warning' },
  paid: { label: 'Paid', tone: 'info' },
  shipped: { label: 'Shipped', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

export const FREE_SHIPPING_LIMIT = 50;
export const SHIPPING_FEE = 4.99;

/** Orders use backend UUIDs — show a short, human-friendly reference instead of the full id. */
export const shortId = (id) => id.replace(/-/g, '').slice(0, 8).toUpperCase();

export const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
