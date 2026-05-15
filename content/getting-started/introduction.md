---
title: Introduction
order: 1
---

# Introduction

Welcome to your new **Zephyrus Leaf** site. This page lives at `content/getting-started/introduction.md`. Edit it, save, and watch the browser reload.

## What you just got

- A working documentation site at `localhost:8080`
- Live reload when you edit anything under `content/`, `templates/`, or `public/`
- Full-text search (press <kbd>⌘</kbd>+<kbd>K</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd>)
- Dark and light themes (toggle in the nav)
- A build command that produces deployable HTML in `dist/`

## Add a page

Drop a new `.md` file anywhere under `content/`:

```
content/
  getting-started/
    introduction.md     <-- you are here
  guides/
    my-first-guide.md   <-- new page
```

Every page needs front matter:

```yaml
---
title: My First Guide
order: 1
---

# My First Guide

Hello world.
```

## Add a section

Sections are top-level folders under `content/`. Register them in `config.yml`:

```yaml
leaf:
  sections:
    getting-started: "Getting Started"
    guides: "Guides"            # new section
    api: "API Reference"        # and another
```

The order in the YAML determines the sidebar order.

## Markdown features

All standard Markdown works, plus a few extras:

### Code blocks with syntax highlighting

```php
function hello(string $name): string
{
    return "Hello, {$name}";
}
```

```javascript
const multiply = (a, b) => a * b;
console.log(multiply(3, 4));
```

### Tables

| Feature | Binary | Composer |
|---------|--------|----------|
| One-command install | ✓ | — |
| Custom controllers | via `leaf eject` | ✓ |
| Composer packages | via `leaf eject` | ✓ |
| Zero runtime deps | ✓ | requires PHP + Composer |

### Callouts

> **Tip:** You can overlay any default template by dropping it at the same path under `templates/`. Try `templates/partials/nav.latte` to override the site navigation.

### Inline code and links

Reference commands inline with backticks: `leaf build`, `leaf dev`, `leaf init`.

Links work with relative paths: see the [page anatomy guide](/getting-started/writing-content) for how to structure a page.

## Next steps

1. Edit `config.yml` — set your project name, version, author, GitHub URL.
2. Drop your logo into `public/assets/images/` and reference it in your templates.
3. Write more pages under `content/`.
4. Run `leaf build` to produce the deployable site in `dist/`.
5. Push `dist/` to any static host: Netlify, Vercel, GitHub Pages, Cloudflare Pages, or your own server.

When you're ready for more, check [Writing Content](/getting-started/writing-content) and [Deployment](/getting-started/deployment).
