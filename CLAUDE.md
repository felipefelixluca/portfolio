# CLAUDE.md — Portfolio Site Design System Rules

This file documents the design system, component patterns, and Figma integration conventions for this codebase. Follow these rules when implementing designs from Figma.

---

## Project Overview

- **Framework**: Astro 5.1.0 (static SSG, zero JS runtime)
- **Styling**: Tailwind CSS 3.4.17 (utility-first, custom config)
- **Content**: MDX + Astro Content Collections
- **Build**: Vite (via Astro) → GitHub Pages
- **Security**: StatiCrypt AES encryption on `/work/*` routes

---

## Design Language

**Bauhaus-inspired**: geometric shapes, primary colors, sharp corners (no border radius), strong grid, minimal ornamentation. The aesthetic is high-contrast ink/paper with bold typographic hierarchy.

---

## 1. Design Tokens

All tokens are defined in `tailwind.config.mjs`. Use Tailwind utility classes — never hardcode hex values or arbitrary CSS values.

### Colors

```js
// tailwind.config.mjs
colors: {
  ink:    '#0A0A0A',   // Primary foreground, body text
  paper:  '#F4F1EA',   // Page background
  rule:   '#1A1A1A',   // Dividers, borders
  muted:  '#5C5C5C',   // Secondary text, captions
  bauhaus: {
    red:    '#E2231A', // Primary accent
    yellow: '#FFCC00', // Secondary accent
    blue:   '#002FA7', // Tertiary accent
  },
}
```

**Usage rules:**
- Background: `bg-paper`, text: `text-ink`
- Accent choice is per-project: each project frontmatter declares `accent: 'red' | 'yellow' | 'blue'`
- Accent classes map to: `text-bauhaus-red`, `bg-bauhaus-yellow`, `border-bauhaus-blue`, etc.
- Never use `text-black` or `bg-white` — always use `ink`/`paper`

### Typography

```js
fontFamily: {
  display: ['"Space Grotesk"', 'system-ui', 'sans-serif'], // Headings
  sans:    ['Inter', 'system-ui', 'sans-serif'],            // Body
  mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'], // Code, eyebrows
}
```

```js
fontSize: {
  'display-2xl': ['clamp(3.5rem, 8vw, 6.5rem)',   { lineHeight: '0.92',  letterSpacing: '-0.02em' }],
  'display-xl':  ['clamp(2.5rem, 5vw, 4rem)',     { lineHeight: '0.95',  letterSpacing: '-0.015em' }],
  'display-lg':  ['clamp(1.875rem, 3.5vw, 2.75rem)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
  'eyebrow':     ['0.75rem',                       { lineHeight: '1',     letterSpacing: '0.18em' }],
  // Standard Tailwind scale (xs → 2xl) also available
}
```

### Spacing

- Use standard Tailwind spacing scale (`4` = 1rem, `6` = 1.5rem, etc.)
- Custom additions: `rule` = 1px, `rule-2` = 2px (for border widths)
- Section vertical rhythm: `py-20 md:py-32` (standard section padding)
- Content gap: `gap-8 md:gap-12`

### Borders & Shape

```js
borderRadius: { none: '0', DEFAULT: '0' }
```

**All corners are sharp (0 radius). This is non-negotiable — no `rounded-*` classes.**

### Layout

```js
maxWidth: {
  page:  '1280px', // `.container-page` wrapper
  prose: '68ch',   // Reading column
}
```

---

## 2. Global CSS Component Classes

Defined in `src/styles/global.css`. Prefer these over re-composing with raw utilities.

| Class | Description |
|---|---|
| `.container-page` | `mx-auto max-w-page px-6 md:px-10` — main content wrapper |
| `.eyebrow` | `font-mono text-eyebrow uppercase tracking-[0.18em]` — section labels |
| `.rule-top` | `border-t-2 border-ink` — top divider |
| `.rule-bottom` | `border-b-2 border-ink` — bottom divider |
| `.link-underline` | Expanding background underline on hover |
| `.case-prose` | Typography for MDX case study body text |
| `.marker-circle` | Bauhaus circle primitive (12×12, `bg-bauhaus-red`) |
| `.marker-square` | Bauhaus square primitive (12×12, `bg-bauhaus-blue`) |
| `.marker-triangle` | Bauhaus triangle primitive (12×12, `bg-bauhaus-yellow`, clip-path) |

---

## 3. Component Library

All components are Astro (`.astro`) files. No React/Vue. No client-side JS unless absolutely required.

### Component Locations

```
src/
  components/
    Callout.astro       — Highlighted decision/insight box
    Footer.astro        — Site footer
    Gallery.astro       — Responsive image grid
    Metric.astro        — KPI display block
    Nav.astro           — Header navigation
    ProjectCard.astro   — Work index list item
    Snapshot.astro      — Project metadata grid
    diagrams/
      CosmeticsSitemap.astro
      CustomerJourney.astro
      DevOpsTimeline.astro
      JourneyOverview.astro
  layouts/
    Layout.astro        — Root layout (Nav + Footer + head)
```

### Component Prop Patterns

```astro
---
// Props are TypeScript-typed in the frontmatter
interface Props {
  title: string;
  accent?: 'red' | 'yellow' | 'blue';  // Maps to bauhaus color
}
const { title, accent = 'red' } = Astro.props;
const accentClass = `bg-bauhaus-${accent}`;
---
```

### Key Components

**ProjectCard** — `href, title, client, role, year, summary, index, accent`

**Metric** — `value: string, label: string, accent?: 'red'|'yellow'|'blue'`

**Gallery** — `items: { src: string, alt: string, caption?: string }[], columns?: 1|2|3`

**Callout** — `title: string, accent?: 'red'|'yellow'|'blue'` + default slot for body

**Snapshot** — `client, role, year, team?, tools?` — renders project metadata grid

---

## 4. Icon System

**No external icon library.** All icons are:

1. **Inline SVG** embedded directly in component templates
2. **Bauhaus marker primitives** via `.marker-circle`, `.marker-square`, `.marker-triangle`

When implementing icons from Figma:
- Export as SVG and inline directly — do not add icon library dependencies
- Add `aria-hidden="true"` to decorative SVGs
- Set `fill="currentColor"` so icons inherit text color
- Keep viewBox; set `class="h-N w-N"` for sizing

```astro
<!-- Correct icon pattern -->
<svg aria-hidden="true" viewBox="0 0 12 14" class="h-3 w-3" fill="currentColor">
  <path d="..." />
</svg>
```

---

## 5. Asset Management

### Image Storage

```
public/images/
  {project-slug}/    — One folder per project
    *.png / *.jpg    — Full-resolution screenshots and mockups
```

- Images are referenced by absolute path: `/images/{project}/{file}.png`
- When the site is served from a subdirectory (GitHub Pages), paths use the `BASE_URL` variable
- No `astro:assets` image optimization pipeline — images are served as-is from `public/`

### Gallery usage in MDX

```yaml
# In project frontmatter
gallery:
  - src: "/images/metlife/hero.png"
    alt: "MetLife dashboard redesign"
    caption: "Before/after comparison of the claims flow"
```

### Fonts

Loaded from Google Fonts CDN in `src/layouts/Layout.astro`. Do not self-host or add new font families without updating both Layout.astro and tailwind.config.mjs.

---

## 6. Content Structure

### Adding a Project

1. Create `src/content/projects/{slug}.mdx`
2. Add images to `public/images/{slug}/`
3. Frontmatter schema (see `src/content/config.ts`):

```yaml
---
title: "Project Title"
client: "Client Name"
role: "IA · UI design · Research"
year: "2024"
order: 6                    # Lower = earlier on home page
accent: red                 # red | yellow | blue
summary: "One-line pitch."
team: "2 designers, 1 PM"   # optional
tools: ["Figma", "FigJam"]  # optional
metrics:
  - { value: "40%", label: "Task completion improvement" }
heroAsset: "/images/slug/hero.png"  # optional
gallery:
  - { src: "/images/slug/img1.png", alt: "Alt text", caption: "Caption" }
galleryColumns: 2           # 1 | 2 | 3
status: published           # published | draft
---
```

### MDX Body Patterns

Import diagram components at the top, then use them inline:

```mdx
import DevOpsTimeline from '../../components/diagrams/DevOpsTimeline.astro';

## Process

<DevOpsTimeline />

## Key Decision

<Callout title="Why we chose X" accent="yellow">
Explanation of the decision rationale.
</Callout>

<Gallery items={frontmatter.gallery} columns={2} />
```

---

## 7. Figma → Code Integration Rules

### When Implementing a Figma Design

1. **Map colors to tokens first.** Every color in the Figma design must map to a Tailwind token (`ink`, `paper`, `muted`, `bauhaus.red/yellow/blue`). If a color exists in the design but not in tokens, flag it — do not use arbitrary values.

2. **No border radius.** If Figma shows rounded corners, implement them as sharp (0px). This is a deliberate design system constraint.

3. **Typography classes.** Map Figma text styles to the custom scale:
   - Hero/display text → `text-display-2xl font-display`
   - Section titles → `text-display-xl font-display`
   - Subsection titles → `text-display-lg font-display`
   - Eyebrow/label → `.eyebrow` class
   - Body text → `text-base font-sans`
   - Captions → `text-sm text-muted`
   - Code/mono → `font-mono`

4. **Use existing components.** Before creating new markup, check if a Gallery, Metric, Callout, or Snapshot component already covers the need.

5. **Spacing rhythm.** Use the standard Tailwind scale. Section padding: `py-20 md:py-32`. Grid gap: `gap-8 md:gap-12`. Component internal padding: `p-6` or `p-8`.

6. **Inline SVGs for icons.** Copy SVG path data from Figma into inline `<svg>` — do not add icon library dependencies.

7. **Responsive breakpoints** (Tailwind defaults):
   - `sm`: 640px
   - `md`: 768px (primary breakpoint for layout shifts)
   - `lg`: 1024px
   - `xl`: 1280px

8. **No JavaScript by default.** Implement interactivity in Astro components without `client:` directives unless absolutely necessary.

9. **Dividers use `.rule-top` / `.rule-bottom`** (2px solid ink), not Tailwind `divide-*` utilities.

10. **Accent color in new components** should be passed as a prop `accent: 'red' | 'yellow' | 'blue'` so projects can theme sections consistently.

### Figma Layer → Code Mapping

| Figma element | Code pattern |
|---|---|
| Frame with max-width | `<div class="container-page">` |
| Section | `<section class="py-20 md:py-32 rule-top">` |
| Eyebrow label | `<p class="eyebrow text-muted mb-4">LABEL</p>` |
| Display heading | `<h2 class="font-display text-display-xl text-ink">` |
| Body copy column | `<div class="max-w-prose">` |
| 2-col grid | `<div class="grid grid-cols-1 md:grid-cols-2 gap-8">` |
| Metric/KPI block | `<Metric value="40%" label="Task completion" accent="red" />` |
| Image grid | `<Gallery items={[...]} columns={2} />` |
| Highlighted callout | `<Callout title="..." accent="yellow">...</Callout>` |
| Horizontal rule | `<hr>` (styled globally as 2px solid ink) |
| Bauhaus shape | `<span class="marker-circle" aria-hidden="true"></span>` |

---

## 8. Diagram Components

Hand-authored data-driven diagrams live in `src/components/diagrams/`. Each accepts a typed data array prop and renders a styled HTML/CSS visualization.

When adding new diagrams from Figma:
- Create a new `.astro` file in `src/components/diagrams/`
- Accept data as typed props (no hardcoded data inside)
- Use Bauhaus accent colors and the standard type scale
- No charting library dependencies — pure HTML/CSS

---

## 9. Build Notes

```bash
npm run dev              # Dev server
npm run build            # Production build + StatiCrypt encryption
npm run build:unencrypted # Production build without encryption
npm run preview          # Preview production build locally
```

The `STATICRYPT_PASSWORD` env variable must be set for the encrypted build. Case studies under `/work/*` are AES-encrypted at build time.
