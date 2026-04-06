# Architecture Guide

This document defines the engineering standards for Bug Writer and should be used as the default reference for implementation and code review.

## Goals

- Keep business logic independent from framework details.
- Keep UI changes low-risk and easy to iterate.
- Preserve predictable behavior as features scale (workspace roles, billing, exports, SEO, AI helpers).

## Layered structure

- `app/`: route composition, page-level server components, metadata, navigation.
- `components/`: UI composition and feature widgets.
- `src/domain/`: business entities and pure domain services.
- `src/server/`: server actions, orchestration, access control, side effects.
- `src/server/repositories` + `lib/prisma`: persistence and infrastructure.
- `lib/`: adapters and platform setup (auth, stripe, i18n, utilities).

Dependency direction:

- `app/components` -> `src/server` -> `src/domain`
- `src/domain` must not import `next/*`, `prisma`, or UI code.
- Infrastructure can depend on domain contracts, not vice versa.

## SOLID in this codebase

1. Single Responsibility Principle
- Each file should have one reason to change.
- Separate UI rendering, server actions, and business rules.

2. Open/Closed Principle
- Add new behavior via new services/modules instead of rewriting existing stable flows.
- Example: add a new export provider as a new domain service.

3. Liskov Substitution Principle
- Implementations must preserve the expected contract behavior.
- Repository implementations should return data in the shape promised by domain contracts.

4. Interface Segregation Principle
- Keep contracts narrow and task-focused.
- Avoid large "god" interfaces for actions or repositories.

5. Dependency Inversion Principle
- Domain logic depends on abstractions/contracts.
- Concrete adapters (Prisma, Stripe, Auth providers) stay at infrastructure boundaries.

## Clean Code rules

- Prefer explicit names over short ambiguous names.
- Keep functions small and focused; extract nested branches into helpers.
- Avoid duplicate logic across pages/actions; centralize shared rules.
- Validate inputs at boundaries (`zod` schemas, action guards).
- Return user-safe errors; never leak secrets or internal stack details.
- Keep comments minimal and meaningful (explain why, not what).

## Server action standards

- Check authentication and workspace access first.
- Enforce role checks before mutations.
- Validate and normalize inputs before DB writes.
- Revalidate only the paths affected by the mutation.
- Add audit logging for important workspace actions.

## UI standards

- Keep display components presentational where possible.
- Move side effects and writes to server actions.
- Maintain accessible semantics (labels, keyboard focus, contrast, readable states).
- Preserve responsive behavior (desktop + mobile) for every major page update.

## Data and security standards

- Never commit `.env` or secrets.
- Keep `.env.example` updated with key names only.
- Use least privilege for external API keys.
- Treat workspace boundaries as strict multi-tenant boundaries.

## Code review checklist

- Is the change in the correct layer?
- Is business logic isolated from framework details?
- Are SOLID boundaries preserved?
- Are inputs validated and permissions enforced?
- Are error and loading states clear in UI?
- Are accessibility basics covered?
- Are affected paths revalidated correctly?

## Definition of done

- Build passes (`npm run build`).
- No secret exposure in tracked files.
- New/changed behavior documented in README or docs when needed.
- UX remains consistent with the product design language.
