import type { ImageMetadata } from 'astro';

/**
 * Every image under src/assets, keyed by its absolute path ("/src/assets/…").
 * Content files (YAML/MDX written by the admin panel) store image paths as strings;
 * this resolves them to Astro image metadata so they get optimised at build time.
 */
const images = import.meta.glob<ImageMetadata>('/src/assets/**/*.{png,jpg,jpeg,webp,avif,gif,tiff}', {
  eager: true,
  import: 'default',
});

export function resolveImage(path?: string | null): ImageMetadata | undefined {
  if (!path) return undefined;
  const clean = path.replace(/^(\.\.\/)+|^\.\//, '').replace(/\?.*$/, '');
  const idx = clean.indexOf('src/assets/');
  const key = idx >= 0 ? '/' + clean.slice(idx) : clean.startsWith('/') ? clean : '/src/assets/' + clean;
  const found = images[key];
  if (!found && import.meta.env.DEV) console.warn(`[media] Image not found: ${path}`);
  return found;
}

/** Normalise a video path written by the admin panel to a public URL. */
export function videoUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const i = path.indexOf('/videos/');
  return i >= 0 ? path.slice(i) : path.startsWith('/') ? path : `/${path}`;
}
