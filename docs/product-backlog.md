# Product Backlog (Must / Should / Nice to Have)

Last updated: 2026-04-03

## Delivery Snapshot

### Done
- Workspace invites + roles (OWNER/ADMIN/MEMBER/VIEWER) with invite accept flow and member management.
- Saved views + bulk actions for History/Library (save/delete view, bulk assign/delete).
- Stripe webhook + customer portal + billing status sync.
- News comments with replies + anti-spam (honeypot + rate limit).
- Password reset flow (request + token reset).
- SEO marketing structure (shared landing header/footer, breadcrumbs, article pages).

### Partial
- Jira/Azure/Linear: create-issue export links are implemented, bi-directional sync is not.
- OAuth sign-in: providers are connected; account-linking UX/error handling still needs polish.

### Next (priority order)
1. OAuth account-linking UX for `OAuthAccountNotLinked`.
2. Workspace audit log completion.
3. Jira / Azure / Linear sync upgrade.
4. Support channel expansion.

## Must

1. Evidence attachments for bug reports (V2)
- Status: Done (monitoring)
- Target:
  - Replace URL-only evidence with upload-based evidence.
  - Add preview/download in History and exports.
- Modules/files:
  - `prisma/schema.prisma` (attachment model linked to `GeneratedBug`/`ReusableBug`)
  - `src/server/actions/dashboard-actions.ts` (upload/delete attachment actions)
  - `components/generator/generator-form.tsx` (dropzone + attachment chips)
  - `app/dashboard/history/page.tsx` (attachment preview/download)
  - `components/dashboard/history-item-inline-editor.tsx` (evidence metadata display)

2. Authentication hardening + OAuth linking UX
- Status: In progress (partial)
- Target:
  - Graceful `OAuthAccountNotLinked` UX with clear recovery path.
  - Keep password reset flow stable.
- Modules/files:
  - `app/(auth)/sign-in/page.tsx`
  - `components/auth/sign-in-form.tsx`
  - `src/server/actions/auth-actions.ts`
  - `lib/auth/config.ts`

3. Billing production readiness
- Status: Done (monitoring)
- Modules/files:
  - `src/domain/services/stripe-billing-service.ts`
  - `app/api/stripe/webhook/route.ts`
  - `src/server/actions/dashboard-actions.ts`
  - `app/dashboard/billing/page.tsx`

4. Workspace invites + roles
- Status: Done (monitoring)
- Modules/files:
  - `prisma/schema.prisma`
  - `src/server/workspace/roles.ts`
  - `src/server/workspace/access.ts`
  - `src/server/actions/dashboard-actions.ts`
  - `app/accept-invite/page.tsx`
  - `app/dashboard/settings/page.tsx`

## Should

1. Audit log (workspace-level)
- Status: In progress
- Target:
  - Track membership changes, exports, deletes, billing changes.
- Modules/files:
  - `prisma/schema.prisma` (new `WorkspaceAuditEvent` model)
  - `src/server/actions/dashboard-actions.ts` (write audit events)
  - `src/server/actions/auth-actions.ts` (security events)
  - `app/dashboard/settings/page.tsx` (read/view events)
  - `app/dashboard/history/page.tsx` (export/delete events)

2. Shared saved views for teams
- Status: Done
- Target:
  - Team-visible presets (`private` vs `workspace`) with owner/admin delete rules.
- Modules/files:
  - `prisma/schema.prisma` (`SavedView` visibility + owner fields)
  - `src/server/actions/dashboard-actions.ts`
  - `components/dashboard/saved-views-bar.tsx`
  - `app/dashboard/history/page.tsx`
  - `app/dashboard/library/page.tsx`

3. Jira / Azure DevOps / Linear sync upgrade
- Status: Planned (export links done)
- Target:
  - Add sync-back status mapping and richer field mapping.
- Modules/files:
  - `src/domain/services/jira-export-service.ts`
  - `src/domain/services/azure-export-service.ts`
  - `src/domain/services/linear-export-service.ts`
  - `components/generator/generator-form.tsx`
  - `app/dashboard/history/page.tsx`

4. Support channel expansion
- Status: Planned
- Target:
  - Add support inbox/microservice placeholder and optional AI support assistant.
- Modules/files:
  - `app/(marketing)/support/page.tsx`
  - `components/marketing/landing-header.tsx`
  - `components/marketing/landing-footer.tsx`

## Nice to Have

1. AI triage priority score
- Status: Discovery
- Modules/files:
  - `src/domain/services/quality-score-service.ts`
  - `components/generator/output-panel.tsx`
  - `app/dashboard/history/page.tsx`

2. Trend-based recommendations (WCAG hotspot alerts)
- Status: Discovery
- Modules/files:
  - `app/dashboard/analytics/page.tsx`
  - `src/domain/services/analytics-service.ts` (new)

3. SEO growth engine
- Status: Active
- Target:
  - Programmatic compare/checklist/example pages with internal links + schema.
- Modules/files:
  - `app/(marketing)/**/page.tsx`
  - `app/sitemap.ts`
  - `components/marketing/news-preview-section.tsx`




