# Aronetiv — artist portfolio site

A simple static site (plain HTML/CSS/JS) with a **Decap CMS** admin panel
(formerly Netlify CMS). The artist adds paintings and edits text through forms
at `/admin/` — no code required. Hosted on **Netlify**, free tier.

## Structure

```
.
├── index.html          Home — single full-bleed painting (the "featured" one)
├── works.html          Works — paintings in a column with captions
├── color-script.html   Color Script — manifesto text
├── about.html          About — bio, links, socials
├── css/style.css       Styles + Nordel @font-face
├── js/app.js           Fetches JSON and renders each page
├── fonts/              Nordel typeface (woff2 + ttf, all weights)
├── data/               CMS-managed content (JSON)
│   ├── site.json
│   ├── works.json
│   ├── color-script.json
│   └── about.json
├── images/
│   ├── works/          Design assets (home painting, color-code strip)
│   └── uploads/        Artist-uploaded photos (via the CMS)
├── admin/
│   ├── index.html      Loads Decap CMS
│   └── config.yml      Admin field config (labels in Ukrainian for the artist)
├── _headers            Caching + font hotlink protection (Netlify)
└── netlify.toml        Netlify build/redirect config
```

No build step: pages read `data/*.json` at runtime via `fetch`.
Decap CMS saves edits as Git commits → Netlify rebuilds automatically.

## Fonts

The site uses the proprietary **Nordel** typeface (© 2025 Oleksii Popovtsev).
Source `.ttf` files were converted to `.woff2`; all six weights are declared in
`css/style.css`. A web font is always downloadable by the browser and cannot be
fully hidden — `_headers` limits cross-domain reuse via CORS, and the license
notice is embedded in the font metadata. For full protection, display text would
need to be rendered as SVG outlines with the font file never shipped.

## Local preview

```powershell
npx serve .
# or
python -m http.server 8000
```

Open http://localhost:8000 (note: `fetch` does not work via `file://`, so a
local server is required).

### Test the admin locally (no Netlify)

```powershell
npx decap-server      # terminal 1
python -m http.server 8000   # terminal 2
```

Open http://localhost:8000/admin/ — `config.yml` already sets
`local_backend: true`, so edits are written straight to `data/*.json` on disk.

## Deploy to Netlify

1. Push the project to a Git repo (GitHub / GitLab).
2. netlify.com → **Add new site → Import from Git**, pick the repo.
   Build command empty, publish directory `.` (already in `netlify.toml`).
3. Set up admin auth — **one of two options**:

### Option A — Netlify Identity (email login) — simplest
- Site settings → **Identity** → Enable Identity.
- Identity → Services → **Enable Git Gateway**.
- Identity → Registration → prefer **Invite only**.
- **Invite users** → enter the artist's email → they set a password and can log
  in at `https://your-site/admin/`.
- `admin/config.yml` is already set to `git-gateway`.

> Netlify Identity is in maintenance mode. It still works, but Option B is more
> future-proof.

### Option B — GitHub OAuth — more future-proof
- In `admin/config.yml` replace the `backend` block with:
  ```yaml
  backend:
    name: github
    repo: YOUR_ACCOUNT/REPO_NAME
    branch: main
  ```
- Create a GitHub OAuth App and add the keys in Netlify
  (Site settings → Access control → OAuth → Install provider → GitHub).
- The artist needs a free GitHub account with access to the repo.

## How the artist uses the admin

1. Open `https://your-site/admin/`, log in.
2. **Paintings** → "+": upload a photo, fill in name/medium/year, toggle
   "show on home" if needed.
3. **Color Script / About** → edit text, links, socials.
4. Click **Publish** → changes are live in ~1 minute.
