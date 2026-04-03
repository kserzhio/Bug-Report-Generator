# SEO Playbook

Last updated: 2026-04-02

## Goal

Build predictable organic growth for Bug Writer by publishing high-intent accessibility QA content clusters that convert into sign-ups.

## Current SEO Surfaces

- Core hub pages:
  - `/news`
  - `/guides`
  - `/checklists`
  - `/examples`
  - `/wcag`
  - `/faq`
  - `/features/bug-report-quality-score`
- Programmatic pages:
  - `/news/[id]`
  - `/examples/[component]`
  - `/wcag/[criterion]`
- High-intent landing pages:
  - `/accessibility-bug-report-template`
  - `/wcag-bug-report-examples`
  - `/compare/keyboard-vs-screen-reader`
  - `/compare/manual-vs-automated-accessibility-testing`

## Weekly Editorial Cadence

1. Monday: keyword selection and page brief
2. Tuesday: draft content and internal links
3. Wednesday: QA review (accuracy + readability + schema)
4. Thursday: publish + index request in Search Console
5. Friday: performance review (impressions, CTR, average position)

## Monthly Publishing Targets

- 4 new longform pages (`/news/[id]` or `/guides/*`)
- 4 updates to existing pages (refresh stats, examples, links)
- 2 new programmatic entries (new components or WCAG criteria mapping)
- 1 new high-intent landing page

## Content Types and Intent

- Informational:
  - `/guides`, `/news`, `/faq`, `/compare/*`
- Commercial investigation:
  - `/features/*`, `/accessibility-bug-report-template`, `/wcag-bug-report-examples`
- Problem-solution:
  - `/examples/*`, `/wcag/*`, `/checklists/*`

## New Page Template

Use this structure for every new SEO page:

1. Primary H1 aligned to one search intent
2. 1-2 sentence intro with clear audience
3. Practical sections with concrete examples
4. Internal links to at least 3 related cluster pages
5. CTA to `/sign-up` or relevant feature page
6. Metadata:
  - `title`
  - `description`
  - `alternates.canonical`
  - `alternates.languages`
7. JSON-LD where appropriate:
  - `Article`, `FAQPage`, `ItemList`, `HowTo`, or `BreadcrumbList`

## On-Page Quality Gate (Must Pass)

- Search intent is explicit in H1 and first paragraph
- One page targets one primary keyword cluster
- Includes at least one comparison table/checklist/list for scanability
- Includes at least one concrete QA workflow or reproduction pattern
- Includes WCAG context when relevant
- Contains at least 3 internal links to cluster pages
- Has canonical and language alternates
- Added to `app/sitemap.ts`

## Internal Linking Rules

- Every new page must link to:
  - one hub page (`/guides`, `/examples`, `/wcag`, `/news`, `/faq`)
  - one feature/commercial page
  - one adjacent topic page
- Hub pages must link back to newest content
- Comparison pages must link to:
  - one checklist page
  - one template or examples page

## Technical SEO Checklist

- `metadataBase` present in root layout
- `robots.ts` allows only public marketing routes
- `sitemap.ts` contains all indexable pages
- Auth and dashboard pages remain `noindex`
- Locale handling:
  - use `?lang=en|uk` alternates
  - middleware syncs `ui-locale` cookie

## KPI Dashboard (Track Weekly)

- Indexed pages count
- Impressions and clicks per cluster (`news/guides/examples/wcag`)
- CTR by page type (hub vs detail vs high-intent)
- Top 20 keywords by average position
- Sign-up conversions from organic landing pages

## 30-Day Content Roadmap

Week 1:
- Publish 2 new `/news/[id]` articles
- Update `/faq` with 4 new Q&A blocks

Week 2:
- Add 2 comparison pages under `/compare/*`
- Refresh `/guides` internal linking blocks

Week 3:
- Add 3 component pages to `/examples/[component]`
- Expand `/wcag/[criterion]` with additional mapped examples

Week 4:
- Publish 1 high-intent landing page
- Audit sitemap coverage and remove low-value thin pages

## Ownership

- Content owner: defines keyword brief and acceptance criteria
- QA/a11y reviewer: validates technical correctness
- Engineering owner: implements page and metadata
- SEO owner: validates indexing and performance after release
