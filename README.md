# Felipe Felix Castro — Portfolio

Static Astro site, Bauhaus-inspired, password-gated with StatiCrypt, deployed to GitHub Pages.

## Stack

- **Astro 5** (static output) + **MDX** for case studies
- **Tailwind CSS** with Bauhaus token overrides
- Hand-authored inline-SVG diagrams (no charting library)
- **StatiCrypt** for client-side AES password gate
- **GitHub Pages** via GitHub Actions

## Local development

```powershell
# install
npm install

# dev server (unencrypted, hot reload)
npm run dev
# → http://localhost:4321

# production build (unencrypted) — useful for previewing without the gate
npm run build:unencrypted
npm run preview

# full production build (Astro + StatiCrypt encryption)
$env:STATICRYPT_PASSWORD = "felipefelix"
npm run build
npm run preview
```

## Editing content

Project case studies are MDX files in `src/content/projects/`:

```
src/content/projects/
├── metlife.mdx
├── narita.mdx
├── cosmetics.mdx
├── golfnet-tv.mdx
└── ai-dungeon-master.mdx
```

Each has frontmatter (title, client, role, year, metrics, gallery) and a body that mixes prose with Astro components (`<DevOpsTimeline />`, `<CustomerJourney />`, `<Callout>`, etc.). The schema is enforced in `src/content/config.ts`.

To add a new project: drop a new `.mdx` file in `src/content/projects/`, give it a unique `order:` (sets sort order on the home page), and it will appear automatically — including its own `/work/<slug>` page.

## Diagrams

Hand-authored SVG/HTML in `src/components/diagrams/`:

- `DevOpsTimeline.astro` — process timeline
- `CustomerJourney.astro` — 4-phase journey + emotion curve + pain points
- `JourneyOverview.astro` — persona step flow
- `CosmeticsSitemap.astro` — before/after IA comparison

All redrawn from the original Adobe Portfolio screenshots and intended to be readable in monochrome (so they print fine to PDF).

## Password

Set in the environment as `STATICRYPT_PASSWORD` (or `PASSWORD`).

- **Locally:** `$env:STATICRYPT_PASSWORD = "felipefelix"` before `npm run build`.
- **CI:** repo Settings → Secrets and variables → Actions → `STATICRYPT_PASSWORD`.

To rotate: change the secret in GitHub and re-run the workflow (or push any commit to `main`).

## Deploy to GitHub Pages

One-time setup (you run these on your machine):

```powershell
# 1. Initialise git in this directory if it isn't already
cd F:\Projects\Portfolio\site
git init
git add .
git commit -m "Initial portfolio scaffold"

# 2. Create the GitHub repo and push
#    Option A — a project-pages repo (URL will be username.github.io/portfolio)
gh repo create felipefelixluca/portfolio --public --source=. --remote=origin --push

#    Option B — a user-pages repo (URL will be username.github.io)
#    Recommended only if you don't already use felipefelixluca.github.io for something else.
# gh repo create felipefelixluca/felipefelixluca.github.io --public --source=. --remote=origin --push
```

Then in the GitHub web UI for the new repo:

1. **Settings → Pages → Source**: choose **GitHub Actions**.
2. **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `STATICRYPT_PASSWORD`
   - Value: `felipefelix`
3. **(Only for Option A — project-pages repo)** Settings → Secrets and variables → Actions → **Variables** tab → New repository variable:
   - Name: `BASE_PATH`
   - Value: `/portfolio`
4. Push any commit to `main` to trigger the workflow. After ~2 min, the site will be live at:
   - Option A: `https://felipefelixluca.github.io/portfolio/`
   - Option B: `https://felipefelixluca.github.io/`

Share the URL plus the password (`felipefelix`).

## Security note

StatiCrypt does **client-side AES encryption** of every HTML page. It is **not** a real authentication system:

- Anyone with the encrypted bundle and the password can read the site.
- A determined attacker with the bundle and a wordlist could brute-force a weak password.

This is appropriate for sharing a portfolio with recruiters and known contacts. Don't use it to host anything you'd be sorry to have public.

If you need real auth, swap GitHub Pages for **Cloudflare Pages + Cloudflare Access** (free, server-side gate).

## Project structure

```
.github/workflows/deploy.yml   GitHub Actions — build + deploy
public/
  Felipe_Felix_Castro_CV.pdf   downloadable CV
  favicon.svg
  images/<project>/            project screenshots
scripts/encrypt.mjs            StatiCrypt post-build wrapper
src/
  content/
    config.ts                  project collection schema
    projects/                  MDX case studies
  components/                  reusable UI + diagrams/
  layouts/Layout.astro         html shell, nav, footer
  pages/
    index.astro                home
    about.astro                about
    work/[slug].astro          dynamic case-study route
    404.astro
  styles/global.css            Bauhaus base styles + prose
astro.config.mjs               site, base, integrations
tailwind.config.mjs            Bauhaus tokens
```
