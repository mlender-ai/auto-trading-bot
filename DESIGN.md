# Research Product DESIGN.md

This file follows the DESIGN.md structure highlighted by VoltAgent's `awesome-design-md`.

The target direction blends three reference attitudes:

- Linear: precise hierarchy, very restrained chrome, clean state changes
- Revolut: fintech trust, sharp data presentation, polished utility surfaces
- Tesla: subtractive hero composition, fewer elements, stronger whitespace

The product should feel like a calm financial briefing desk, not a noisy dashboard.

## 1. Visual Theme & Atmosphere

- Light, quiet, editorial-first interface
- Financial product, but never "trading terminal cosplay"
- High information quality, low visual noise
- One primary canvas, one secondary surface, one accent color
- The first screen should answer "What matters now?" in one glance
- Dense data belongs in depth pages, not on the home surface

## 2. Color Palette & Roles

| Token | Hex | Role |
| --- | --- | --- |
| `canvas` | `#f4f7fb` | app background |
| `surface` | `#ffffff` | main cards and sheets |
| `surface-muted` | `#f8fafd` | secondary cards and grouped blocks |
| `surface-accent` | `#f2f6ff` | selected or highlighted neutral state |
| `line` | `rgba(15, 23, 42, 0.08)` | default border |
| `line-strong` | `rgba(15, 23, 42, 0.14)` | stronger separators |
| `text` | `#111827` | primary text |
| `text-soft` | `rgba(17, 24, 39, 0.72)` | secondary text |
| `text-dim` | `rgba(17, 24, 39, 0.50)` | tertiary text |
| `text-muted` | `rgba(17, 24, 39, 0.62)` | long-form support copy |
| `accent` | `#2563eb` | primary action |
| `accent-soft` | `rgba(37, 99, 235, 0.10)` | primary action background |
| `positive` | `#0f9f6e` | gains and constructive signals |
| `positive-soft` | `rgba(15, 159, 110, 0.12)` | gain backgrounds |
| `danger` | `#d9485f` | downside or risk |
| `danger-soft` | `rgba(217, 72, 95, 0.12)` | danger backgrounds |
| `warning` | `#b7791f` | event watch or caution |
| `warning-soft` | `rgba(183, 121, 31, 0.12)` | warning backgrounds |

## 3. Typography Rules

- Primary UI font: modern sans stack with Korean support
- Headline font: serif display only for major editorial headlines and depth-page hero copy
- Numbers, tickers, and compact metadata use monospace
- Use only three text intensities: primary, soft, dim
- Never use oversized display type unless it is the single focus of a section

### Scale

- `hero`: 40-52px, serif, tight tracking, only once per page
- `h1`: 32-40px, sans or serif depending on context
- `h2`: 22-28px
- `h3`: 18-20px
- `body`: 14-16px
- `meta`: 11-12px, uppercase only when short

## 4. Component Stylings

### Surfaces

- Default cards are white with subtle border and low shadow
- Secondary grouped areas use muted surface rather than more borders
- Avoid nested card-on-card-on-card stacks when a divider will do

### Buttons

- Primary buttons are soft blue fills, not saturated blocks
- Secondary buttons are white pills with border
- CTA copy should describe the destination, not the implementation
- Never show system words like `pipeline`, `provider`, `runtime`, `JSON`, or internal status labels on user-facing primary surfaces

### Tabs

- Tabs are compact pills with one active surface
- Active tab uses white fill and subtle elevation
- Inactive tabs remain flat and quiet

### Chips

- Chips should be lightweight filters, not mini buttons pretending to be tabs
- Keep them short, one line, and semantically grouped

### Search Overlay

- Search should feel like a command palette, but visually calm
- Use one large input, grouped result panels, and explicit CTA labels

### Empty / Loading / Error States

- Same design language as the main product
- Calm explanation, one recovery CTA, one navigation CTA
- No stack traces, raw API language, or developer phrasing

## 5. Layout Principles

- Home page = overview first, browse second
- Each section should answer one question:
  - overview: what matters now
  - news: what changed
  - ticker: what to do about this symbol
  - meeting: what the system recommends next
- Prefer two-column layouts only when both columns are semantically linked
- On mobile, everything becomes a single reading column

### Spacing

- Use a strict 4px base rhythm
- Default gaps: 8, 12, 16, 20, 24
- Large sections: 28-32

### Radius

- Small controls: 14-16
- Panels: 20-24
- Large hero surfaces: 28-32

## 6. Depth & Elevation

- Shadows must stay soft and short
- Prefer separation by spacing and border over dramatic elevation
- Floating overlay can use stronger shadow, but main page should stay near-flat

## 7. Do's and Don'ts

### Do

- Group related information into one readable surface
- Use typography and spacing for hierarchy before adding more cards
- Let the hero explain the market in one sentence
- Keep supporting lists short and scannable
- Make depth pages the place for dense analysis

### Don't

- Do not expose implementation details to users
- Do not mix three or more visual emphases in one row
- Do not use gradients unless they are extremely subtle
- Do not create dashboard clutter with many equal-weight panels
- Do not rely on color alone for state changes

## 8. Responsive Behavior

- Desktop: one main overview canvas plus one narrow context rail
- Tablet: collapse overview into a single column before reducing type size
- Mobile: hero, strategy, checklist, watchlist, then navigation
- Search overlay becomes full-width sheet on small screens
- Touch targets minimum 40px height

## 9. Agent Prompt Guide

When generating UI for this project:

- Start from the design system, not from ad hoc card layouts
- Reduce element count before adding decoration
- Treat the homepage as a briefing cover page
- Move anything verbose or analytical into ticker/sector depth pages
- Keep user-facing copy human and direct
- If unsure, choose the more minimal option
