import Link from "next/link";

import { ComponentSuggestionForm } from "@/components/dashboard/component-suggestion-form";
import { DeleteComponentSuggestionButton } from "@/components/dashboard/delete-component-suggestion-button";
import { TemplateForm } from "@/components/dashboard/template-form";
import { TemplatesBrowser } from "@/components/dashboard/templates-browser";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMessages } from "@/lib/i18n/messages";
import { normalizeLocale } from "@/lib/i18n/locale";
import { prisma } from "@/lib/prisma/client";
import { getCurrentWorkspaceContext } from "@/src/server/queries/workspace";

function toLabel(value: string, locale: "en" | "uk") {
  const localized: Record<string, { en: string; uk: string }> = {
    general: { en: "General", uk: "Загальне" },
    forms: { en: "Forms", uk: "Форми" },
    dialogs: { en: "Dialogs / Modals", uk: "Діалоги / модалки" },
    navigation: { en: "Navigation", uk: "Навігація" },
    tables: { en: "Tables", uk: "Таблиці" },
    "status-messages": { en: "Status messages", uk: "Статусні повідомлення" },
    keyboard: { en: "Keyboard", uk: "Клавіатура" },
    "screen-reader": { en: "Screen reader", uk: "Скрінрідер" },
    aria: { en: "ARIA", uk: "ARIA" },
    "content-structure": { en: "Content / structure", uk: "Контент / структура" }
  };

  if (localized[value]) {
    return localized[value][locale];
  }

  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default async function TemplatesPage({
  searchParams
}: {
  searchParams: Promise<{
    edit?: string;
    editSuggestion?: string;
    suggestionCategory?: string;
    suggestionComponent?: string;
    suggestionQuery?: string;
  }>;
}) {
  const context = await getCurrentWorkspaceContext();
  const params = await searchParams;
  const locale = normalizeLocale(context.workspace.uiLocale);
  const t = getMessages(locale);
  const c =
    locale === "uk"
      ? {
          system: "Системний",
          custom: "Кастомний",
          severity: "Серйозність",
          componentSection: "Підказки проблем за компонентом",
          componentSubtitle:
            "Керуйте типовими accessibility проблемами для компонентів у вашому workspace.",
          componentKey: "Компонент",
          category: "Категорія",
          tags: "Теги",
          actual: "Фактична поведінка",
          expected: "Очікувана поведінка",
          wcag: "WCAG",
          filtersTitle: "Фільтри",
          allCategories: "Усі категорії",
          allComponents: "Усі компоненти",
          searchPlaceholder: "Пошук за назвою, нотатками або WCAG...",
          applyFilters: "Застосувати",
          resetFilters: "Скинути"
        }
      : {
          system: "System",
          custom: "Custom",
          severity: "Severity",
          componentSection: "Component issue suggestions",
          componentSubtitle:
            "Manage reusable accessibility issue suggestions for components in your workspace.",
          componentKey: "Component",
          category: "Category",
          tags: "Tags",
          actual: "Actual behavior",
          expected: "Expected behavior",
          wcag: "WCAG",
          filtersTitle: "Filters",
          allCategories: "All categories",
          allComponents: "All components",
          searchPlaceholder: "Search by title, notes, WCAG...",
          applyFilters: "Apply",
          resetFilters: "Reset"
        };

  const [templates, componentSuggestions] = await Promise.all([
    prisma.bugTemplate.findMany({
      where: {
        OR: [{ workspaceId: context.workspace.id }, { isSystem: true }]
      },
      orderBy: [{ isSystem: "desc" }, { title: "asc" }]
    }),
    prisma.componentIssueSuggestion.findMany({
      where: {
        OR: [{ workspaceId: context.workspace.id }, { isSystem: true }]
      },
      orderBy: [{ isSystem: "desc" }, { componentKey: "asc" }, { title: "asc" }]
    })
  ]);

  const customTemplates = templates.filter((template) => !template.isSystem);
  const customSuggestions = componentSuggestions.filter((suggestion) => !suggestion.isSystem);

  const suggestionCategory = (params.suggestionCategory ?? "").trim().toLowerCase();
  const suggestionComponent = (params.suggestionComponent ?? "").trim().toLowerCase();
  const suggestionQuery = (params.suggestionQuery ?? "").trim().toLowerCase();

  const categoryOptions = Array.from(new Set(componentSuggestions.map((item) => item.category)))
    .filter(Boolean)
    .sort();
  const componentOptions = Array.from(new Set(componentSuggestions.map((item) => item.componentKey)))
    .filter(Boolean)
    .sort();

  const filteredComponentSuggestions = componentSuggestions.filter((suggestion) => {
    if (suggestionCategory && suggestion.category !== suggestionCategory) {
      return false;
    }

    if (suggestionComponent && suggestion.componentKey !== suggestionComponent) {
      return false;
    }

    if (!suggestionQuery) {
      return true;
    }

    const searchable = [
      suggestion.title,
      suggestion.notes ?? "",
      suggestion.wcagCriterion,
      suggestion.componentKey,
      suggestion.category,
      suggestion.tags.join(" ")
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(suggestionQuery);
  });

  const filterParams = new URLSearchParams();
  if (suggestionCategory) filterParams.set("suggestionCategory", suggestionCategory);
  if (suggestionComponent) filterParams.set("suggestionComponent", suggestionComponent);
  if (suggestionQuery) filterParams.set("suggestionQuery", suggestionQuery);

  const withSuggestionFilters = (value: string) => {
    const next = new URLSearchParams(filterParams);
    next.set("editSuggestion", value);
    return `/dashboard/templates?${next.toString()}`;
  };

  return (
    <div className="space-y-8">
      <TemplatesBrowser
        locale={locale}
        templates={templates.map((template) => ({
          id: template.id,
          title: template.title,
          description: template.description,
          category: template.category,
          severity: template.severity,
          wcagVersion: template.wcagVersion,
          wcagCriterion: template.wcagCriterion,
          isSystem: template.isSystem
        }))}
      />

      <section id="template-form" className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {locale === "uk" ? "Керування шаблонами" : "Template management"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {locale === "uk"
              ? "Створюйте та редагуйте кастомні шаблони для вашого workspace."
              : "Create and edit custom templates for your workspace."}
          </p>
        </div>

        <TemplateForm
          editableTemplates={customTemplates.map((template) => ({
            id: template.id,
            title: template.title,
            category: template.category,
            severity: template.severity,
            wcagVersion: template.wcagVersion as "2.1" | "2.2",
            description: template.description,
            component: template.component,
            screenName: template.screenName,
            affectedUsers: template.affectedUsers,
            actualBehavior: template.actualBehavior,
            expectedBehavior: template.expectedBehavior,
            wcagCriterion: template.wcagCriterion,
            toolsUsed: template.toolsUsed,
            notes: template.notes
          }))}
          selectedTemplateId={params.edit}
        />
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {c.componentSection}
          </h2>
          <p className="text-sm text-muted-foreground">{c.componentSubtitle}</p>
        </div>

        <form method="get" className="grid gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.category}</p>
            <select name="suggestionCategory" defaultValue={suggestionCategory} className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">{c.allCategories}</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {toLabel(option, locale)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.componentKey}</p>
            <select name="suggestionComponent" defaultValue={suggestionComponent} className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">{c.allComponents}</option>
              {componentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.filtersTitle}</p>
            <div className="flex gap-2">
              <input
                name="suggestionQuery"
                defaultValue={suggestionQuery}
                placeholder={c.searchPlaceholder}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground" type="submit">
                {c.applyFilters}
              </button>
              <Link href="/dashboard/templates" className="inline-flex h-10 items-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700">
                {c.resetFilters}
              </Link>
            </div>
          </div>
        </form>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            {filteredComponentSuggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{suggestion.title}</CardTitle>
                    <Badge className="capitalize">{suggestion.isSystem ? c.system : c.custom}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                    <Badge>{c.componentKey}: {suggestion.componentKey}</Badge>
                    <Badge>{c.category}: {toLabel(suggestion.category, locale)}</Badge>
                    <Badge>{c.severity}: {suggestion.severity}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  {suggestion.tags.length > 0 ? (
                    <p>
                      <span className="font-semibold text-slate-900">{c.tags}:</span> {suggestion.tags.join(", ")}
                    </p>
                  ) : null}
                  <p>
                    <span className="font-semibold text-slate-900">{c.actual}:</span> {suggestion.actualBehavior}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">{c.expected}:</span> {suggestion.expectedBehavior}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">{c.wcag}:</span> {suggestion.wcagCriterion}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {!suggestion.isSystem ? (
                      <Link href={withSuggestionFilters(suggestion.id)} className="text-sm font-semibold text-slate-700">
                        {locale === "uk" ? "Редагувати" : "Edit"}
                      </Link>
                    ) : null}
                    {!suggestion.isSystem ? (
                      <DeleteComponentSuggestionButton suggestionId={suggestion.id} />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <ComponentSuggestionForm
            editableSuggestions={customSuggestions.map((suggestion) => ({
              id: suggestion.id,
              title: suggestion.title,
              componentKey: suggestion.componentKey,
              category: suggestion.category,
              tags: suggestion.tags,
              severity: suggestion.severity,
              affectedUsers: suggestion.affectedUsers,
              actualBehavior: suggestion.actualBehavior,
              expectedBehavior: suggestion.expectedBehavior,
              wcagCriterion: suggestion.wcagCriterion,
              notes: suggestion.notes
            }))}
            selectedSuggestionId={params.editSuggestion}
          />
        </div>
      </section>
    </div>
  );
}
