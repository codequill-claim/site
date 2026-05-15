# CodeQuill site

Marketing landing + documentation for [codequill.xyz](https://codequill.xyz), built with [Zephyrus Leaf](https://leaf.ophelios.com) (Binary CLI tier).

- **Landing** lives at `/` — dark-only, ported from the previous React+Vite source.
- **Docs** live at `/docs/` — 33 markdown pages in 9 sections, light/dark toggle.
- **One project, one host, one deploy artifact** (`dist/`).

## Develop

```
make dev      # leaf dev on :8080, live-reload
```

## Build

```
make build    # leaf build + post-build relocation of docs under /docs/
make check    # build + smoke tests
make preview  # serve dist/ via python http.server :4173
```

`make build` runs `leaf build` then moves the docs sections into `dist/docs/`, mirrors assets, rewrites `sitemap.xml` URLs to use the `/docs/` prefix, and generates a `dist/docs/index.html` meta-refresh to the first doc page. `base_url: "/docs"` in `config.yml` causes the docs-side HTML to emit prefixed URLs natively.

## Deploy

`dist/` is the deployment artifact (committed to git per Leaf convention). Any static host that serves directory-index requests works. Cloudflare Pages with the repo connected and `dist/` as the output directory is the recommended path.

## Structure

```
content/        9 sections of markdown documentation
public/         static assets — fog video, logos, favicons, CSS, JS
templates/      Latte overlays — landing page, head + nav + landing sections
Makefile        dev / build / check / preview
config.yml      site metadata, base_url, sections, production_url
dist/           generated output (committed)
```
