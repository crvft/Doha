// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

// The public site is fully static (pre-rendered HTML, near-zero JS).
// Only the /keystatic admin routes run on demand (as Vercel functions).
export default defineConfig({
  site: process.env.SITE_URL || 'https://crvft.vercel.app',
  output: 'static',
  adapter: vercel({ imageService: false }),
  integrations: [mdx(), react(), keystatic()],
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'always' },
  image: {
    // Generous breakpoints so phones get small files and retina desktops get crisp ones.
    breakpoints: [360, 480, 640, 750, 828, 1080, 1280, 1600, 1920, 2400],
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
