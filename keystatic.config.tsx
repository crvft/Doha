import { config, collection, fields, singleton } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';
import { useEffect, useMemo } from 'react';

type Asset = { data: Uint8Array; filename: string; extension: string } | null;

/** Turns an uploaded/loaded asset into a temporary URL for previews in the editor. */
function useAssetUrl(asset: Asset, type: string) {
  const url = useMemo(
    () => (asset?.data ? URL.createObjectURL(new Blob([asset.data as BlobPart], { type })) : null),
    [asset, type],
  );
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  return url;
}
const Thumb = ({ asset }: { asset: Asset }) => {
  const ext = asset?.extension ?? 'png';
  const url = useAssetUrl(asset, ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`);
  return url ? <img src={url} style={{ height: 96, borderRadius: 10, objectFit: 'cover', maxWidth: 200 }} /> : null;
};
const VidThumb = ({ asset }: { asset: Asset }) => {
  const url = useAssetUrl(asset, 'video/mp4');
  return url ? <video src={url} muted loop autoPlay playsInline style={{ height: 96, borderRadius: 10, maxWidth: 200 }} /> : null;
};
const previewBox = { display: 'flex', gap: 8, flexWrap: 'wrap', padding: '4px 0' } as const;
const capStyle = { fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#999', marginTop: 6, textTransform: 'uppercase' } as const;

/**
 * Admin panel schema (visit /keystatic).
 *
 * - Locally (`npm run dev`) edits are written straight to the files in this repo.
 * - In production the panel commits to GitHub, which triggers a redeploy on Vercel.
 *   Set KEYSTATIC_GITHUB_CLIENT_ID / _SECRET / KEYSTATIC_SECRET (see README) to enable it.
 */
const useGitHub = Boolean(import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO);

// Images are stored under src/assets so Astro can optimise them (AVIF/WebP, responsive sizes).
const img = (label: string, dir: string, description?: string) =>
  fields.image({
    label,
    description,
    directory: `src/assets/${dir}`,
    publicPath: `/src/assets/${dir}/`,
  });

// Videos are served as-is from /public/videos.
const video = (label: string, dir: string) =>
  fields.file({
    label,
    description: 'MP4 (H.264) works everywhere. Keep it short, muted and under ~8 MB.',
    directory: `public/videos/${dir}`,
    publicPath: `/videos/${dir}/`,
  });

const caseStudyComponents = {
  Figure: block({
    label: 'Image figure',
    description: 'One or more images with an optional caption. Use “Carousel” for a swipeable strip.',
    schema: {
      images: fields.array(
        fields.object({
          src: img('Image', 'case-studies'),
          alt: fields.text({ label: 'Alt text (describe the image)' }),
        }),
        { label: 'Images', itemLabel: (p) => p.fields.alt.value || p.fields.src.value?.filename || 'Image' },
      ),
      layout: fields.select({
        label: 'Layout',
        options: [
          { label: 'Stacked (full width)', value: 'stack' },
          { label: 'Side by side', value: 'row' },
          { label: 'Carousel', value: 'carousel' },
        ],
        defaultValue: 'stack',
      }),
      frame: fields.select({
        label: 'Frame',
        options: [
          { label: 'Bordered (rounded, light border)', value: 'border' },
          { label: 'Plain', value: 'plain' },
        ],
        defaultValue: 'border',
      }),
      caption: fields.text({ label: 'Caption (optional)' }),
    },
    ContentView: ({ value }) => (
      <div>
        <div style={previewBox}>
          {value.images.map((im, i) => (
            <Thumb key={i} asset={im.src as Asset} />
          ))}
        </div>
        {value.caption && <div style={capStyle}>{value.caption}</div>}
      </div>
    ),
  }),
  Video: block({
    label: 'Video',
    description: 'Looping, muted video(s) that play when scrolled into view.',
    schema: {
      videos: fields.array(
        fields.object({
          src: video('Video file', 'case-studies'),
          poster: img('Poster image (optional)', 'case-studies'),
        }),
        { label: 'Videos', itemLabel: (p) => p.fields.src.value?.filename || 'Video' },
      ),
      layout: fields.select({
        label: 'Layout',
        options: [
          { label: 'Stacked (full width)', value: 'stack' },
          { label: 'Side by side', value: 'row' },
        ],
        defaultValue: 'stack',
      }),
      caption: fields.text({ label: 'Caption (optional)' }),
    },
    ContentView: ({ value }) => (
      <div>
        <div style={previewBox}>
          {value.videos.map((v, i) => (
            <VidThumb key={i} asset={v.src as Asset} />
          ))}
        </div>
        {value.caption && <div style={capStyle}>{value.caption}</div>}
      </div>
    ),
  }),
  Callout: wrapper({
    label: 'Callout card',
    description: 'A grey note card with a heading, e.g. “Keep in Mind”.',
    schema: { title: fields.text({ label: 'Heading' }) },
  }),
};

export default config({
  storage: useGitHub
    ? { kind: 'github', repo: import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO as `${string}/${string}` }
    : { kind: 'local' },
  ui: {
    brand: { name: 'mico / crvft' },
    navigation: { Pages: ['home', 'caseStudiesPage'], Content: ['caseStudies'] },
  },
  singletons: {
    home: singleton({
      label: 'Home page',
      path: 'src/content/home/',
      format: { data: 'yaml' },
      schema: {
        name: fields.text({ label: 'Full name', defaultValue: 'Michael Okoye' }),
        nickname: fields.text({ label: 'Nickname line (after the dash)', defaultValue: 'or just Mico' }),
        mobileName: fields.text({ label: 'Name shown on phones', defaultValue: 'Mico' }),
        role: fields.text({ label: 'Role', defaultValue: 'Product & interaction designer' }),
        bio: fields.text({
          label: 'Bio',
          description: 'Blank line = new paragraph. Links: [Frolickk](/case-studies/005)',
          multiline: true,
        }),
        bioMobile: fields.text({
          label: 'Bio on phones (optional)',
          description: 'Leave empty to use the same bio everywhere.',
          multiline: true,
        }),
        note: fields.text({ label: 'Personal note (italic)', multiline: true }),
        ctaLead: fields.text({ label: 'CTA text', defaultValue: 'Currently open for work' }),
        ctaLink: fields.text({ label: 'CTA link text', defaultValue: 'Email me' }),
        email: fields.text({ label: 'Email address' }),
        availability: fields.text({ label: 'Footer: availability' }),
        prompt: fields.text({ label: 'Footer: prompt (italic)' }),
        socials: fields.array(
          fields.object({ label: fields.text({ label: 'Label' }), url: fields.url({ label: 'URL' }) }),
          { label: 'Social links', itemLabel: (p) => p.fields.label.value },
        ),
        copyright: fields.text({ label: 'Copyright line', defaultValue: '2026 — Michael Okoye' }),
        gallery: fields.array(
          fields.object({
            label: fields.text({ label: 'Name / alt text' }),
            kind: fields.select({
              label: 'Type',
              options: [
                { label: 'Image', value: 'image' },
                { label: 'Video', value: 'video' },
              ],
              defaultValue: 'image',
            }),
            image: img('Image (or video poster)', 'home'),
            video: video('Video file (for type “Video”)', 'home'),
            size: fields.select({
              label: 'Size in the grid',
              description: 'Small = half width · Tall = half width, two rows (phone shots) · Large = full width, two rows',
              options: [
                { label: 'Small (1×1)', value: 'small' },
                { label: 'Tall (1×2)', value: 'tall' },
                { label: 'Large (2×2)', value: 'large' },
              ],
              defaultValue: 'small',
            }),
            fit: fields.select({
              label: 'Fit',
              options: [
                { label: 'Fill the frame (crop)', value: 'cover' },
                { label: 'Show whole media (letterbox)', value: 'contain' },
              ],
              defaultValue: 'cover',
            }),
            show: fields.select({
              label: 'Show on',
              options: [
                { label: 'All devices', value: 'all' },
                { label: 'Desktop & tablet only', value: 'desktop' },
                { label: 'Phones only', value: 'mobile' },
              ],
              defaultValue: 'all',
            }),
            mobileOrder: fields.integer({
              label: 'Position on phones (optional)',
              description: 'Lower numbers come first. Leave empty to keep the desktop order.',
            }),
          }),
          {
            label: 'Gallery',
            description: 'Drag to reorder. Order here = order on desktop.',
            itemLabel: (p) => `${p.fields.label.value || 'Item'} · ${p.fields.size.value}`,
          },
        ),
      },
    }),
    caseStudiesPage: singleton({
      label: 'Case studies page',
      path: 'src/content/case-studies-page/',
      format: { data: 'yaml' },
      schema: {
        eyebrow: fields.text({ label: 'Eyebrow', defaultValue: 'PIXEL PEEP' }),
        title: fields.text({ label: 'Title', defaultValue: 'Case Studies & Artifacts' }),
        tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags', itemLabel: (p) => p.value }),
        description: fields.text({ label: 'Description', multiline: true }),
      },
    }),
  },
  collections: {
    caseStudies: collection({
      label: 'Case studies',
      slugField: 'title',
      path: 'src/content/case-studies/*/',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
          slug: { label: 'URL slug', description: 'e.g. “006” → /case-studies/006' },
        }),
        seoTitle: fields.text({ label: 'Browser tab / SEO title (optional)' }),
        number: fields.text({ label: 'Card number', description: 'Shown on the card, e.g. “05”' }),
        order: fields.integer({
          label: 'Order on the case studies page',
          description: 'Higher numbers come first.',
          defaultValue: 0,
        }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        draft: fields.checkbox({ label: 'Draft (hide from the site)', defaultValue: false }),
        cardTitle: fields.text({ label: 'Card title (optional)', description: 'Defaults to the title.' }),
        shortTitle: fields.text({ label: 'Short title (phone list)' }),
        summary: fields.text({ label: 'Summary (card text + SEO description)', multiline: true }),
        cover: img('Card image', 'case-studies'),
        hero: img('Hero image', 'case-studies'),
        glance: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', description: 'e.g. Role' }),
            value: fields.text({ label: 'Value', description: 'Links: [text](https://…)' }),
          }),
          { label: 'At a Glance', itemLabel: (p) => `${p.fields.label.value}: ${p.fields.value.value}` },
        ),
        tldr: fields.array(fields.text({ label: 'Point', multiline: true }), {
          label: 'TL;DR points',
          itemLabel: (p) => p.value,
        }),
        download: fields.object(
          {
            title: fields.text({ label: 'Card heading (leave empty to hide the card)' }),
            body: fields.text({ label: 'Text (markdown)', multiline: true }),
            label: fields.text({ label: 'Button label', defaultValue: 'Download' }),
            url: fields.url({ label: 'Button link' }),
          },
          { label: 'Download card (optional)' },
        ),
        toc: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            heading: fields.text({ label: 'Heading it jumps to (exact text)' }),
          }),
          {
            label: 'Contents sidebar (optional)',
            description: 'Leave empty to list every section heading automatically.',
            itemLabel: (p) => p.fields.label.value,
          },
        ),
        body: fields.mdx({
          label: 'Body',
          options: {
            heading: [2, 3],
            image: { directory: 'src/assets/case-studies', publicPath: '/src/assets/case-studies/' },
          },
          components: caseStudyComponents,
        }),
      },
    }),
  },
});
