# Bug Writer Roadmap Tracker

## Legend
- [x] done
- [~] in progress
- [ ] planned

## Current Sprint
- [x] Localize app-wide UI baseline (EN/UK) with provider, cookie, workspace locale sync.
- [x] Component-based issue suggestions UX fix (not Pro-limited): quick component chips in Generator.
- [x] Component-based issue suggestions v2: multi-select issue chips + Apply selected action.
- [x] Component-based issue suggestions v3: DB-backed system suggestions (Prisma model + seed + Generator integration).
- [x] Component suggestion management in Templates: create/edit/delete workspace suggestions.
- [x] Categories/tags for component suggestions + filter controls in Templates.
- [x] History UX upgrade: inline quick edit + duplicate without leaving History.
- [x] AI quality layer: response checks + automatic rule-based fallback before applying AI result.
- [x] Localization pass for new features (templates filters/categories, history inline actions, quality/fallback copy).

## Next Steps (Ordered)
- [ ] Optional polish: move remaining per-page string objects into centralized i18n message maps.
- [ ] Optional polish: add localization coverage check (simple lint/test for hardcoded UI strings).

## Notes
- Component suggestions are available on Free plan and Pro plan.
- Suggestions appear when `Component` contains known keys or via quick component chips.
- System suggestions are seeded globally; custom suggestions are workspace-scoped.
- History now supports in-place edits (severity/component/screen/WCAG/project/notes) and duplicate action with toasts.
- AI assist now applies a quality score, and automatically falls back to rule-based guidance if quality is below threshold.
