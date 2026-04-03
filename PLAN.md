# Product Plan

## Priority Order

1. Workspace invites + roles
2. Evidence attachments
3. Saved views + bulk actions
4. Jira / Azure DevOps / Linear export
5. Stripe webhooks + customer portal

## Backlog

### Must

1. Workspace invites + roles
2. Evidence attachments
3. Saved views + bulk actions
4. Jira export
5. Stripe webhooks + customer portal

### Should

1. Azure DevOps export
2. Linear export
3. Audit log for workspace actions
4. Review flow for bug reports
5. Usage limits for team plans
6. Email notifications for invites, role changes, and export events

### Nice to Have

1. Comment threads on bug reports
2. Attachment previews and image annotations
3. Shared saved views for teams
4. Export templates per tracker
5. Activity feed in the dashboard
6. SLA and aging analytics by project

## Epic Roadmap

### 1. Workspace Invites + Roles

Goals:

1. Invite members by email
2. Accept invites
3. Support roles: OWNER, ADMIN, MEMBER, VIEWER
4. Apply permissions to settings, templates, projects, library, and generator management actions
5. Add a workspace members screen and a workspace switcher

Repository areas:

1. `prisma/schema.prisma`
2. `src/server/actions/auth-actions.ts`
3. `src/server/actions/dashboard-actions.ts`
4. `src/server/queries/workspace.ts`
5. `lib/auth/config.ts`
6. `app/dashboard/settings/page.tsx`
7. `components/dashboard/*`

### 2. Evidence Attachments

Goals:

1. Add screenshot and file evidence support
2. Add video links
3. Add reproducible steps
4. Add browser, OS, device, and assistive tech matrix
5. Include evidence in preview and exports

Repository areas:

1. `prisma/schema.prisma`
2. `src/validation/generator.ts`
3. `components/generator/generator-form.tsx`
4. `src/domain/services/bug-report-service.ts`
5. `src/domain/services/rewrite-service.ts`
6. `src/server/actions/dashboard-actions.ts`
7. `components/generator/output-panel.tsx`

### 3. Saved Views + Bulk Actions

Goals:

1. Save filters for history and library
2. Bulk delete
3. Bulk assign to project
4. Bulk export
5. Bulk tag management for library items

Repository areas:

1. `prisma/schema.prisma`
2. `app/dashboard/history/page.tsx`
3. `app/dashboard/library/page.tsx`
4. `components/library/library-list.tsx`
5. `src/server/actions/dashboard-actions.ts`
6. `components/dashboard/saved-view-picker.tsx`
7. `components/dashboard/bulk-actions-toolbar.tsx`

### 4. Tracker Integrations

Goals:

1. Jira export first
2. Azure DevOps export second
3. Linear export third
4. Map title, description, severity, labels, repro steps, attachments, and WCAG metadata
5. Add export presets per tracker

Repository areas:

1. `lib/integrations/*`
2. `src/domain/services/export/*`
3. `src/server/actions/dashboard-actions.ts`
4. `components/generator/output-panel.tsx`
5. `components/generator/generator-form.tsx`
6. `app/dashboard/settings/page.tsx`
7. `prisma/schema.prisma`

### 5. Billing Productionization

Goals:

1. Add Stripe webhooks
2. Sync subscription status
3. Add customer portal
4. Reflect billing state in the UI
5. Prepare team billing support

Repository areas:

1. `app/dashboard/billing/page.tsx`
2. `src/server/actions/dashboard-actions.ts`
3. `lib/stripe/client.ts`
4. `app/api/stripe/webhook/route.ts`
5. `src/server/queries/workspace.ts`
6. `prisma/schema.prisma`

## Current Delivery Plan

### Phase 1

1. Save roadmap and backlog in-repo
2. Add workspace invite data model
3. Add role-aware access helpers
4. Add settings member management UI
5. Add invite acceptance flow
6. Add basic workspace switching via `defaultWorkspaceId`

### Phase 2

1. Apply permission checks across dashboard actions
2. Add invite email delivery
3. Add richer member activity and audit trails

### Phase 3

1. Start evidence attachments implementation
2. Add Jira export from generator output

### Phase 4

1. Add workspace-level Jira settings persistence
2. Add Azure DevOps export
3. Add Linear export
4. Unify tracker settings in workspace settings UI

## Development Tasks By File And Module

1. `components/generator/output-panel.tsx`
   Add tracker export controls and wire callbacks for Jira/Azure/Linear.
2. `components/generator/generator-form.tsx`
   Build export handlers, tracker config UX, validation, and local persistence fallback.
3. `src/domain/services/jira-export-service.ts`
   Keep URL-builder logic isolated and reusable for create-issue links.
4. `src/domain/services/azure-export-service.ts`
   Add Azure DevOps work-item URL payload mapping and sanitization.
5. `src/domain/services/linear-export-service.ts`
   Add Linear issue creation URL payload mapping and label handling.
6. `app/dashboard/settings/page.tsx`
   Expose integration settings section for tracker defaults and export behavior.
7. `components/dashboard/settings-form.tsx`
   Add fields for tracker base URLs, project keys/team ids, and issue type defaults.
8. `src/server/actions/dashboard-actions.ts`
   Add secure server actions for tracker export URL generation and settings updates.
9. `src/server/i18n/action-messages.ts`
   Add localized success/error messages for integration actions.
10. `prisma/schema.prisma`
    Add workspace-level integration settings (jira/azure/linear) and audit fields.
11. `prisma/migrations/*`
    Add migrations for integration settings and backfill defaults.
12. `lib/stripe/client.ts`
    Add webhook-safe helpers and customer portal session creation.
13. `app/api/stripe/webhook/route.ts`
    Implement webhook signature verification and subscription state sync.
14. `app/dashboard/billing/page.tsx`
    Add customer portal CTA, webhook-driven status states, and billing UX polish.
15. `src/server/queries/workspace.ts`
    Surface integration and billing state to dashboard pages with role-aware access.
