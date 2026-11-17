# mico / crvft — portfolio

My portfolio, rebuilt from Framer as a fast static site, with an admin panel for editing content.

## Stack

| Part | What | Why |
|---|---|---|
| Framework | [Astro](https://astro.build) | Turns every page into plain HTML/CSS at build time, so visitors download almost no JavaScript. |
| Styling | Plain CSS with design tokens (`src/styles/global.css`) | The colours, type and spacing come from the Framer project. |
| Motion | CSS transitions and keyframes, plus `linear()` spring curves generated from Framer's spring settings | Runs on the compositor (GPU), so it stays smooth on low-end phones. Turns off when the visitor has "reduce motion" on. |
| Images | Astro's image pipeline (sharp) | Every image becomes responsive WebP at the right sizes and is lazy-loaded below the fold. |
| Video | Muted inline `<video>` | Only plays while on screen and never preloads. |
| Navigation | Speculation Rules and View Transitions | Pages are prerendered on hover, with a smooth cross-fade between them. No JS router. |
| Admin | [Keystatic](https://keystatic.com) at `/keystatic` | Visual editor with drag-and-drop. Content is stored as files in this repo, so there's no database. |
| Hosting | Vercel | Static pages on the CDN. Only the admin runs as a serverless function. |

JavaScript shipped to visitors: about 1 KB for video autoplay, plus about 2 KB on pages with an image ticker.

## Editing content (the admin)

```bash
npm install
npm run dev
```

Then open **http://localhost:4321/keystatic**.

- **Home page**: name, bio, links and the **Gallery**. Drag items to reorder them, upload an image or video, and choose a size:
  - *Small*: half width
  - *Tall*: half width, two rows (good for phone mockups)
  - *Large*: full width
  You can also hide an item on phones or desktop, or give it a different position on phones.
- **Case studies**: add a new one with **Add**. The body is a rich text editor. Use the **+** menu to insert:
  - **Image figure**: one image, several stacked, side by side, or an auto-scrolling **carousel**
  - **Video**: looping clip(s) with a caption
  - **Callout card**: a grey note box

  The *At a Glance*, *TL;DR*, *Download* card and *Contents* sidebar are fields on the right.
- **Case studies page**: eyebrow, title, tags and description.

Locally, saving writes straight to the files in `src/content/` and `src/assets/`. Commit and push to publish.

### Turning on the admin in production

So you can edit from `yoursite.com/keystatic` without touching code:

1. Set `PUBLIC_KEYSTATIC_GITHUB_REPO=crvft/Doha` in a local `.env` and run `npm run dev`.
2. Open `/keystatic`. Keystatic offers to **create a GitHub App** for you. Follow it; it writes the keys to `.env`.
3. Copy all `KEYSTATIC_*` and `PUBLIC_KEYSTATIC_*` values into Vercel (Project, then Settings, then Environment Variables) and redeploy.
4. In the GitHub App settings, add `https://<your-domain>/api/keystatic/github/oauth/callback` as a callback URL.

After that, every **Save** in the admin is a commit to GitHub, and Vercel redeploys in about a minute.

## Project layout

```
src/
  content/            ← all editable content (written by the admin)
    home/index.yaml
    case-studies-page/index.yaml
    case-studies/<slug>/index.mdx
  assets/             ← images (optimised at build)
  components/         ← UI pieces (Gallery, CaseCard, EmailCTA, mdx/Figure, mdx/Ticker…)
  pages/              ← routes: /, /case-studies, /case-studies/[slug]
  styles/global.css   ← fonts, tokens, motion
public/
  videos/  fonts/     ← served as-is
keystatic.config.tsx  ← admin schema
```

## Commands

```bash
npm run dev       # local dev + admin at /keystatic
npm run build     # production build
npm run preview   # preview the build
```

## Notes

- **Fonts**: Junicode VF, Geist, Inter Display and Berkeley Mono are self-hosted in `public/fonts`. Junicode is subset to Latin, which cuts it from 1.2 MB to about 130 KB.
- **Berkeley Mono licence**: the font is the **trial** version. Buy a licence, or swap it in `src/styles/global.css`, before using a custom domain.
- **Breakpoints** match Framer:
  - ≥1440: Desktop
  - 1200–1439: Desktop S
  - 810–1199: Tablet
  - <810: Phone
