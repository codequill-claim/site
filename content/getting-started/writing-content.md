---
title: Writing Content
order: 2
---

# Writing Content

Every page is a Markdown file in `content/`. Front matter at the top tells Leaf how to order and title it.

## Page anatomy

```markdown
---
title: Installation
order: 2
description: How to install the project.
---

# Installation

Content starts here...

## First section

Regular Markdown from here on.
```

| Field | Required | Purpose |
|-------|----------|---------|
| `title` | yes | Shown in the sidebar and `<title>` tag |
| `order` | yes | Position in the sidebar (lower = higher) |
| `description` | no | Used for `<meta name="description">` and OG tags |

If no `description` is set, Leaf generates one automatically from the first ~160 characters of the rendered content.

## Headings and table of contents

Every `## H2` and `### H3` in a page becomes an entry in the right-hand TOC. Headings get anchor links automatically:

- `## Installation` becomes `#installation`
- `### macOS setup` becomes `#macos-setup`

## Code blocks

Fenced blocks with a language tag get syntax highlighting via Prism.js:

````markdown
```python
def greet(name: str) -> str:
    return f"Hello, {name}"
```
````

Supported out of the box: `bash`, `php`, `javascript`, `typescript`, `python`, `go`, `rust`, `yaml`, `json`, `sql`, `markup`. Others can be added by dropping a Prism component into your templates.

Every code block gets a copy button in the top-right corner automatically.

## Inline code

Backticks produce styled inline code: `leaf build` renders as `leaf build`.

## Tables

GitHub-flavored Markdown tables work as you'd expect:

| Column A | Column B | Column C |
|----------|----------|----------|
| `item-1` | left aligned | 42 |
| `item-2` | middle | 7 |

Alignment with colons:

| Left | Center | Right |
|:-----|:------:|------:|
| a | b | c |

## Links

- **Internal:** `[Installation](/getting-started/installation)` — leading slash, no `.md` extension.
- **External:** `[GitHub](https://github.com)` — rendered with a subtle icon when the `target` is `_blank`.

## Images

```markdown
![Alt text describing the image](/assets/images/diagram.png)
```

Drop images under `public/assets/images/` and reference with a leading slash.

## Front matter tips

- Use `order: 5` for a page you want fifth in the sidebar.
- Leave gaps (10, 20, 30, ...) so you can insert pages between without renumbering.
- `title` appears in three places: sidebar label, `<title>` tag, and OG graph tag.

## Blocks outside Markdown

For anything Markdown doesn't cover (custom layouts, interactive components), drop an `.latte` override into your project's `templates/` directory. The binary merges your overrides on top of the bundled theme at build time.
