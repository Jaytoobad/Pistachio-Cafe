export const CURRENCY = 'GH\u20b5';
export const CURRENCY_SYMBOL = 'GH\u20b5';

export function formatMoney(amount) {
  return `GH\u20b5${Number(amount || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatAccra(iso, options = {}) {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleString('en-GH', { timeZone: 'Africa/Accra', ...options });
}

export function isTodayAccra(iso) {
  const now = new Date();
  const d = new Date(iso);
  return d.toLocaleDateString('en-GH', { timeZone: 'Africa/Accra' }) === now.toLocaleDateString('en-GH', { timeZone: 'Africa/Accra' });
}

export function minutesAgo(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

export function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
