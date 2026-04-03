# Bug Writer for QA & Accessibility

Production-ready SaaS starter for QA engineers and accessibility specialists who need to generate polished bug reports fast using structured templates, live previews, saved history, and subscription-ready billing.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component primitives
- React Hook Form + Zod
- Prisma + PostgreSQL (Neon-ready)
- Auth.js / NextAuth
- Stripe-ready billing foundation
- Optional AI enhancement layer via OpenRouter or Gemini

## Folder structure

```text
.
|-- app/
|   |-- (auth)/
|   |-- (marketing)/
|   |-- api/
|   `-- dashboard/
|-- components/
|   |-- dashboard/
|   |-- forms/
|   |-- generator/
|   |-- layout/
|   |-- marketing/
|   `-- ui/
|-- lib/
|   |-- auth/
|   |-- billing/
|   |-- prisma/
|   `-- utils/
|-- prisma/
|-- public/
|-- src/
|   |-- domain/
|   |   |-- entities/
|   |   |-- repositories/
|   |   `-- services/
|   |-- server/
|   |   |-- actions/
|   |   `-- repositories/
|   `-- validation/
`-- types/
```

## Architecture notes

- `app/`: route composition and page-level server components
- `components/`: reusable UI and feature components
- `src/domain/`: core business entities, templates, and formatting services
- `src/server/`: server actions and repository implementations
- `lib/`: framework and infrastructure setup such as Prisma, auth, billing plans, and utilities
- `prisma/`: schema and seed data for system templates

This split keeps UI concerns separate from domain formatting logic and infrastructure, making the codebase easier to extend for team workspaces, comments, approvals, and collaboration flows later.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GITLAB_CLIENT_ID="..."
GITLAB_CLIENT_SECRET="..."
MICROSOFT_CLIENT_ID="..."
MICROSOFT_CLIENT_SECRET="..."
MICROSOFT_TENANT_ID="common"
EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="Bug Writer <no-reply@example.com>"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
AI_PROVIDER="openrouter"
OPENROUTER_API_KEY="..."
OPENROUTER_MODEL="openrouter/auto"
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-2.5-flash"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Notes:

- Use the Neon pooled connection string for `DATABASE_URL`.
- Use the Neon direct connection string for `DIRECT_URL`.
- For AI enhancement you can configure either OpenRouter or Gemini. The app will try the preferred provider first and fall back to the other if both are configured.
- If you only want one provider, set its key and leave the other empty.

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Seed the default accessibility templates:

```bash
npm run prisma:seed
```

5. Start the app:

```bash
npm run dev
```

## Included product surfaces

- Marketing landing page with pricing and CTA
- Auth entry pages for credentials or magic-link based sign-in
- Protected dashboard shell with left sidebar navigation
- Real-time bug report generator with copy, reset, save, reusable library save, and export to Markdown, plain text, JSON, and CSV
- Template system with seeded accessibility templates plus custom create, edit, and delete flows
- History with search, severity/WCAG/component filters, open/edit, and duplicate
- Projects, Library, Analytics, Billing, and Settings pages backed by Prisma queries
- Rule-based accessibility insights with optional AI enhancement for WCAG mapping and fix suggestions
- Smart expansion from short notes and component-based issue suggestions
- Rewrite modes for formal, simple, developer-friendly, and client-friendly output
- VPAT preview mode

## Seeded template examples

- Missing accessible name
- Dialog not announced
- Focus not visible
- Incorrect heading structure
- Status message not announced
- Expand/collapse state not announced
- `aria-invalid` error not associated
- Change of context on input

## AI enhancement flow

- The default experience uses deterministic rules for WCAG suggestions and fix guidance.
- The `Enhance with AI` action sends the current bug draft to the configured provider and returns:
  - improved WCAG criterion suggestion
  - refined actual and expected behavior
  - affected users wording
  - problem summary
  - why it matters explanation
  - concrete fix steps
  - code example
- This keeps the product useful without AI, while allowing richer suggestions when a provider is configured.

## Next implementation steps

- Add Stripe checkout portal and webhook handlers
- Add workspace invitation and collaboration primitives
- Add Jira and Azure DevOps export adapters
- Expand AI support with cached responses and confidence scoring

## Documentation

- Product backlog: `docs/product-backlog.md`
- SEO playbook: `docs/seo-playbook.md`
