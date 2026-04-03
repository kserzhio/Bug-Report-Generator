import type { Locale } from "@/lib/i18n/locale";

type Messages = {
  common: {
    save: string;
    reset: string;
    copy: string;
    delete: string;
    edit: string;
    duplicate: string;
    apply: string;
    loading: string;
    signIn: string;
    signOut: string;
    startFree: string;
  };
  sidebar: {
    brandTop: string;
    brandBottom: string;
    generator: string;
    templates: string;
    history: string;
    library: string;
    projects: string;
    analytics: string;
    news: string;
    billing: string;
    settings: string;
  };
  auth: {
    signInTitle: string;
    signInSubtitle: string;
    continueWithGoogle: string;
    continueWithMicrosoft: string;
    continueWithGithub: string;
    continueWithGitLab: string;
    or: string;
    email: string;
    password: string;
    continue: string;
    signingIn: string;
    createAccountTitle: string;
    createAccountSubtitle: string;
    fullName: string;
    creatingAccount: string;
    createAccount: string;
    alreadyAccount: string;
  };
  marketing: {
    navTitle: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    viewPricing: string;
    featureGuidedTitle: string;
    featureGuidedDesc: string;
    featureTemplateTitle: string;
    featureTemplateDesc: string;
    featureScaleTitle: string;
    featureScaleDesc: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    bullet4: string;
    preview: string;
    wcagAware: string;
    pricingLabel: string;
    pricingTitle: string;
    pricingSubtitle: string;
    perMonth: string;
    upgradeToPro: string;
  };
  dashboard: {
    generatorTitle: string;
    generatorSubtitle: string;
    templatesTitle: string;
    templatesSubtitle: string;
    historyTitle: string;
    historySubtitle: string;
    projectsTitle: string;
    projectsSubtitle: string;
    libraryTitle: string;
    librarySubtitle: string;
    analyticsTitle: string;
    analyticsSubtitle: string;
    newsTitle: string;
    newsSubtitle: string;
    billingTitle: string;
    billingSubtitle: string;
    settingsTitle: string;
    settingsSubtitle: string;
    workspaceDefaults: string;
  };
};

export const messages: Record<Locale, Messages> = {
  en: {
    common: {
      save: "Save",
      reset: "Reset",
      copy: "Copy",
      delete: "Delete",
      edit: "Edit",
      duplicate: "Duplicate",
      apply: "Apply",
      loading: "Loading...",
      signIn: "Sign in",
      signOut: "Sign out",
      startFree: "Start free"
    },
    sidebar: {
      brandTop: "Bug Writer",
      brandBottom: "QA & Accessibility",
      generator: "Generator",
      templates: "Templates",
      history: "History",
      library: "Library",
      projects: "Projects",
      analytics: "Analytics",
      news: "News",
      billing: "Billing",
      settings: "Settings"
    },
    auth: {
      signInTitle: "Sign in",
      signInSubtitle: "Use email and password. Magic links will work too when SMTP is configured.",
      continueWithGoogle: "Continue with Google",
      continueWithMicrosoft: "Continue with Microsoft",
      continueWithGithub: "Continue with GitHub",
      continueWithGitLab: "Continue with GitLab",
      or: "or",
      email: "Email",
      password: "Password",
      continue: "Continue",
      signingIn: "Signing in...",
      createAccountTitle: "Create account",
      createAccountSubtitle: "Start on the free plan and upgrade later for unlimited generations.",
      fullName: "Full name",
      creatingAccount: "Creating account...",
      createAccount: "Create account",
      alreadyAccount: "Already have an account?"
    },
    marketing: {
      navTitle: "Bug Writer for QA & Accessibility",
      heroBadge: "Built for QA and accessibility specialists",
      heroTitle: "Write polished accessibility bug reports in minutes, not hours.",
      heroSubtitle:
        "Use structured templates, real-time previews, and WCAG-aware fields to generate consistent, professional defect reports your engineering team can act on immediately.",
      viewPricing: "View pricing",
      featureGuidedTitle: "Guided bug creation",
      featureGuidedDesc:
        "Standardized fields for severity, actual and expected behavior, WCAG criteria, tools used, and affected users.",
      featureTemplateTitle: "Template-driven workflow",
      featureTemplateDesc:
        "Start from recurring accessibility defects across forms, dialogs, navigation, tables, and assistive technology interactions.",
      featureScaleTitle: "Ready for scale",
      featureScaleDesc:
        "A modular architecture with Prisma, Auth.js, Stripe-ready billing, and a clean domain layer for future collaboration features.",
      bullet1: "Structured output tailored for QA and a11y workflows",
      bullet2: "Prebuilt templates for recurring accessibility defects",
      bullet3: "Live markdown preview with copy, save, and export actions",
      bullet4: "Team-ready foundation for future collaboration",
      preview: "Preview",
      wcagAware: "WCAG-aware",
      pricingLabel: "Pricing",
      pricingTitle: "Start free, upgrade when you need unlimited output and exports.",
      pricingSubtitle: "A simple plan structure for individual specialists and growing QA teams.",
      perMonth: "per month",
      upgradeToPro: "Upgrade to Pro"
    },
    dashboard: {
      generatorTitle: "Bug report generator",
      generatorSubtitle: "Generate professional QA and accessibility defects using a structured workflow.",
      templatesTitle: "Templates",
      templatesSubtitle: "Prebuilt accessibility templates plus your workspace custom templates.",
      historyTitle: "History",
      historySubtitle: "Project-centric bug history with grouped results and quick actions.",
      projectsTitle: "Projects",
      projectsSubtitle: "Organize generated reports by product area and drill into project-specific bug history.",
      libraryTitle: "Reusable bug library",
      librarySubtitle: "Save frequently used bugs, keep tags and categories, and reuse them in the generator.",
      analyticsTitle: "Analytics",
      analyticsSubtitle: "Workspace-level visibility into severity distribution, WCAG hotspots, and project load.",
      newsTitle: "Accessibility News & Resources",
      newsSubtitle: "Follow practical updates, standards, and tooling notes for QA and accessibility teams.",
      billingTitle: "Billing",
      billingSubtitle: "Free plan includes limited generations. Pro unlocks unlimited use and advanced exports.",
      settingsTitle: "Settings",
      settingsSubtitle: "Manage workspace preferences and generator defaults.",
      workspaceDefaults: "Workspace defaults"
    }
  },
  uk: {
    common: {
      save: "Зберегти",
      reset: "Скинути",
      copy: "Копіювати",
      delete: "Видалити",
      edit: "Редагувати",
      duplicate: "Дублювати",
      apply: "Застосувати",
      loading: "Завантаження...",
      signIn: "Увійти",
      signOut: "Вийти",
      startFree: "Почати безкоштовно"
    },
    sidebar: {
      brandTop: "Bug Writer",
      brandBottom: "QA та доступність",
      generator: "Генератор",
      templates: "Шаблони",
      history: "Історія",
      library: "Бібліотека",
      projects: "Проєкти",
      analytics: "Аналітика",
      news: "Новини",
      billing: "Білінг",
      settings: "Налаштування"
    },
    auth: {
      signInTitle: "Вхід",
      signInSubtitle: "Використайте email і пароль. Magic link теж працюватиме, коли налаштований SMTP.",
      continueWithGoogle: "Продовжити через Google",
      continueWithMicrosoft: "Продовжити через Microsoft",
      continueWithGithub: "Продовжити через GitHub",
      continueWithGitLab: "Продовжити через GitLab",
      or: "або",
      email: "Email",
      password: "Пароль",
      continue: "Продовжити",
      signingIn: "Вхід...",
      createAccountTitle: "Створити акаунт",
      createAccountSubtitle: "Почніть з безкоштовного плану і оновіться пізніше для безлімітних генерацій.",
      fullName: "Повне ім'я",
      creatingAccount: "Створення акаунта...",
      createAccount: "Створити акаунт",
      alreadyAccount: "Вже маєте акаунт?"
    },
    marketing: {
      navTitle: "Bug Writer для QA та доступності",
      heroBadge: "Створено для QA та accessibility спеціалістів",
      heroTitle: "Пишіть якісні accessibility bug-репорти за хвилини, а не години.",
      heroSubtitle:
        "Використовуйте структуровані шаблони, прев'ю в реальному часі та WCAG-поля, щоб створювати послідовні професійні дефект-репорти.",
      viewPricing: "Переглянути ціни",
      featureGuidedTitle: "Кероване створення багів",
      featureGuidedDesc:
        "Стандартизовані поля для severity, actual/expected behavior, WCAG-критеріїв, tools used та affected users.",
      featureTemplateTitle: "Шаблонний workflow",
      featureTemplateDesc:
        "Починайте з типових accessibility-дефектів для форм, діалогів, навігації, таблиць та взаємодій з assistive technologies.",
      featureScaleTitle: "Готово до масштабу",
      featureScaleDesc:
        "Модульна архітектура з Prisma, Auth.js, Stripe-ready білінгом і чистим domain-рівнем для майбутньої колаборації.",
      bullet1: "Структурований результат для QA та a11y workflow",
      bullet2: "Готові шаблони для типових accessibility дефектів",
      bullet3: "Live markdown preview з copy, save та export",
      bullet4: "Основа для командної роботи",
      preview: "Прев'ю",
      wcagAware: "WCAG-aware",
      pricingLabel: "Тарифи",
      pricingTitle: "Почніть безкоштовно, переходьте на Pro для безліміту та експорту.",
      pricingSubtitle: "Проста структура планів для індивідуальних спеціалістів і QA-команд.",
      perMonth: "на місяць",
      upgradeToPro: "Оновити до Pro"
    },
    dashboard: {
      generatorTitle: "Генератор bug-репортів",
      generatorSubtitle: "Створюйте професійні QA та accessibility дефекти через структурований workflow.",
      templatesTitle: "Шаблони",
      templatesSubtitle: "Готові accessibility шаблони плюс ваші кастомні шаблони workspace.",
      historyTitle: "Історія",
      historySubtitle: "Історія багів по проєктах з групуванням і швидкими діями.",
      projectsTitle: "Проєкти",
      projectsSubtitle: "Організуйте репорти за product area і переглядайте історію багів по проєкту.",
      libraryTitle: "Бібліотека багів",
      librarySubtitle: "Зберігайте часто вживані баги, теги та категорії і повторно використовуйте їх у генераторі.",
      analyticsTitle: "Аналітика",
      analyticsSubtitle: "Видимість по workspace: розподіл severity, WCAG hot spots та навантаження по проєктах.",
      newsTitle: "Новини та ресурси з доступності",
      newsSubtitle: "Практичні оновлення, стандарти й нотатки по інструментах для QA та accessibility команд.",
      billingTitle: "Білінг",
      billingSubtitle: "Безкоштовний план має ліміт генерацій. Pro відкриває безліміт і розширений експорт.",
      settingsTitle: "Налаштування",
      settingsSubtitle: "Керуйте параметрами workspace і дефолтами генератора.",
      workspaceDefaults: "Налаштування workspace"
    }
  }
};

export function getMessages(locale: Locale) {
  return messages[locale];
}
