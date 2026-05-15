---
title: Deployment
order: 3
---

# Deployment

Run `leaf build` (or `composer build` if you're on the Composer path). The output lands in `dist/`. That's your deployable site.

## Static hosts

Any static host works. The build produces plain HTML, CSS, JS, plus `sitemap.xml` and `robots.txt` if you've configured a production URL.

| Host | Build command | Publish dir |
|------|---------------|-------------|
| Netlify | `curl -fsSL https://leaf.ophelios.com/install.sh \| sh && leaf build` | `dist` |
| Vercel | same as Netlify | `dist` |
| Cloudflare Pages | same | `dist` |
| GitHub Pages | build locally, commit `dist/`, push | `dist` |
| DigitalOcean App Platform | same as Netlify | `dist` |
| Any server | build locally, upload `dist/` | wherever you serve static files |

## Set your production URL

Edit `config.yml`:

```yaml
leaf:
  production_url: "https://docs.example.com"
```

This turns on:

- `dist/sitemap.xml` with every page URL
- `dist/robots.txt` pointing at the sitemap
- Canonical `<link>` tags on every page
- Accurate OpenGraph URLs

Without it, the build skips sitemap and robots (no assumptions about where your site lives).

## Custom domain

Most hosts handle DNS + HTTPS automatically once you point a domain at them. No per-platform quirks here; pick your host and follow their custom-domain guide.

## Committing `dist/`

One common pattern: build locally, commit `dist/`, let your host serve it without running a build step. Simple, works everywhere. Trade-off: every content change is a build + commit.

Alternative: let the host run the build. Faster iteration, but your build environment needs whatever Leaf needs (`leaf` binary, or PHP + Composer).

## Base URL for non-root deploys

If your site lives at `https://example.com/docs/` instead of the root, set:

```yaml
leaf:
  base_url: "/docs"
```

All links and asset URLs get prefixed automatically.
