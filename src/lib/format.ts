const pad = (n: number) => String(n).padStart(2, '0');

/** 30.10.26 */
export const shortDate = (d: Date) => `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${String(d.getUTCFullYear()).slice(2)}`;

const ord = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/** 30th October, 2026 */
export const longDate = (d: Date) =>
  `${ord(d.getUTCDate())} ${d.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' })}, ${d.getUTCFullYear()}`;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[’'"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
