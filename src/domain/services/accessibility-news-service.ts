export type AccessibilityNewsCategory = "standards" | "tooling" | "guides" | "case-studies";
export type AccessibilityNewsAudience = "qa" | "frontend" | "design" | "pm";

export type AccessibilityNewsDetailSection = {
  title: string;
  points: string[];
};

export type AccessibilityNewsDetail = {
  intro: string;
  sections: AccessibilityNewsDetailSection[];
};

export type AccessibilityNewsItem = {
  id: string;
  title: string;
  summary: string;
  category: AccessibilityNewsCategory;
  audience: AccessibilityNewsAudience[];
  publishedAt: string;
  source: string;
  url?: string;
  readingMinutes: number;
  isFeatured?: boolean;
  detail?: AccessibilityNewsDetail;
  wcagCodes?: string[];
};

export const ACCESSIBILITY_NEWS_ITEMS: AccessibilityNewsItem[] = [
  {
    id: "focus-visible-vs-not-obscured",
    title: "Focus Visible vs Focus Not Obscured: QA Testing Pattern",
    summary:
      "A practical guide for testing focus indicator quality and ensuring focused elements are not hidden by sticky UI or overlays.",
    category: "guides",
    audience: ["qa", "frontend", "design"],
    publishedAt: "2026-04-02",
    source: "Bug Writer Editorial",
    readingMinutes: 9,
    isFeatured: true,
    wcagCodes: ["2.4.7", "2.4.11", "2.4.12", "2.4.13"],
    detail: {
      intro:
        "Teams often verify focus presence but miss focus visibility quality and obstruction edge cases. Modern layouts with sticky headers, drawers, and floating actions make this a frequent release risk.",
      sections: [
        {
          title: "What you will learn",
          points: [
            "How to separate baseline focus visibility checks from focus obstruction checks.",
            "How sticky UI and overlays break keyboard accessibility despite visible focus styles.",
            "How to document focus regressions with reproducible viewport evidence."
          ]
        },
        {
          title: "How to test in practice",
          points: [
            "Navigate every interactive flow with keyboard only and track focus at each state change.",
            "Test at desktop and mobile breakpoints where sticky UI is most likely to overlap focus targets.",
            "Record short video evidence when focus is partially or fully hidden during navigation."
          ]
        },
        {
          title: "How to report issues",
          points: [
            "Include exact viewport, zoom level, and UI state at the moment focus becomes obscured.",
            "Capture expected focus behavior and map each issue to the most relevant WCAG criterion.",
            "Attach both static screenshots and short interaction clips for fast triage."
          ]
        },
        {
          title: "Common mistakes",
          points: [
            "Marking focus as pass just because outline exists in some states.",
            "Skipping responsive breakpoints where sticky headers hide focused controls.",
            "Reporting visual overlap without keyboard sequence steps."
          ]
        }
      ]
    }
  },
  {
    id: "status-messages-and-aria-live-qa",
    title: "Status Messages and ARIA Live Regions: QA Verification Guide",
    summary:
      "How to test async feedback, announcements, and polite/assertive live regions so users are informed without focus changes.",
    category: "guides",
    audience: ["qa", "frontend"],
    publishedAt: "2026-03-31",
    source: "Bug Writer Editorial",
    readingMinutes: 8,
    wcagCodes: ["4.1.3", "4.1.2", "3.3.1"],
    detail: {
      intro:
        "A frequent accessibility failure is visual feedback without equivalent announcements. Live-region behavior should be verified in realistic async interactions like saves, validation, and loading states.",
      sections: [
        {
          title: "What you will learn",
          points: [
            "When status updates should be announced without moving focus.",
            "How to validate polite vs assertive live regions in form and async workflows.",
            "How to avoid duplicate, missing, or stale announcements."
          ]
        },
        {
          title: "How to test in practice",
          points: [
            "Trigger async flows (save, upload, validation) in NVDA and VoiceOver and capture announcements.",
            "Confirm announcement timing and message text match visible status updates.",
            "Check repeated actions to ensure updates are consistently announced."
          ]
        },
        {
          title: "How to report issues",
          points: [
            "Document exact user action and expected spoken announcement.",
            "Include AT name/version and browser in the environment matrix.",
            "Attach transcript-style notes of what was announced vs expected."
          ]
        },
        {
          title: "Common mistakes",
          points: [
            "Relying on visual toast appearance as proof of announcement.",
            "Testing only one screen reader/browser combination.",
            "Omitting repeated-action checks where announcements silently fail."
          ]
        }
      ]
    }
  },
  {
    id: "keyboard-vs-screenreader",
    title: "Keyboard Navigation vs Screen Reader Testing: What Is the Difference?",
    summary:
      "Learn when keyboard-only checks are enough, when screen reader testing is mandatory, and how to report each type of failure.",
    category: "guides",
    audience: ["qa", "frontend", "design"],
    publishedAt: "2026-03-28",
    source: "Bug Writer Editorial",
    readingMinutes: 11,
    isFeatured: true,
    wcagCodes: ["2.1.1", "2.4.3", "4.1.2", "2.4.7"],
    detail: {
      intro:
        "Keyboard navigation validates operability and focus flow, while screen reader testing validates semantic structure and announcements. Teams that separate these checks catch more defects early and avoid shipping inaccessible workflows.",
      sections: [
        {
          title: "What you will learn",
          points: [
            "How keyboard-only testing validates focus visibility, order, and operability.",
            "How screen readers validate labels, roles, states, and dynamic announcements.",
            "Why passing keyboard checks does not guarantee assistive technology compatibility."
          ]
        },
        {
          title: "How to test in practice",
          points: [
            "Run keyboard flow first using Tab, Shift+Tab, Enter, Space, and Escape through primary user paths.",
            "Then run the same flows in NVDA (Windows) or VoiceOver (macOS) to validate spoken output.",
            "Capture browser and device matrix in evidence so engineering can reproduce exactly."
          ]
        },
        {
          title: "How to report issues",
          points: [
            "Separate findings into keyboard failures vs screen-reader announcement failures.",
            "Document expected behavior in plain language and map to WCAG criterion.",
            "Attach exact reproduction steps and evidence artifacts for each environment."
          ]
        },
        {
          title: "Common mistakes",
          points: [
            "Using only automated tools and assuming semantic correctness.",
            "Marking keyboard test as pass without checking visible focus style.",
            "Merging multiple assistive-tech bugs into one report without clear scope."
          ]
        }
      ]
    }
  },
  {
    id: "wcag-overview",
    title: "WCAG Overview and How to Use It in QA",
    summary:
      "A practical entry point for mapping defects to criteria and keeping bug reports consistent across teams.",
    category: "standards",
    audience: ["qa", "frontend", "pm"],
    publishedAt: "2026-03-15",
    source: "W3C WAI",
    url: "https://www.w3.org/WAI/standards-guidelines/wcag/",
    readingMinutes: 8,
    isFeatured: true
  },
  {
    id: "aria-authoring-practices",
    title: "ARIA Authoring Practices Patterns",
    summary:
      "Reference interaction patterns for dialogs, tabs, menus, and composite widgets with keyboard behavior.",
    category: "standards",
    audience: ["qa", "frontend", "design"],
    publishedAt: "2026-03-10",
    source: "W3C APG",
    url: "https://www.w3.org/WAI/ARIA/apg/",
    readingMinutes: 10
  },
  {
    id: "evidence-matrix-for-bug-reports",
    title: "Evidence Matrix for Accessibility Bug Reports",
    summary:
      "A practical template for screenshots, video captures, reproduction steps, and browser/device matrix.",
    category: "guides",
    audience: ["qa", "pm"],
    publishedAt: "2026-03-08",
    source: "Bug Writer Editorial",
    readingMinutes: 7,
    wcagCodes: ["3.3.1", "3.3.3", "4.1.2", "2.4.3"],
    detail: {
      intro:
        "Strong evidence turns a bug report into an implementation-ready task. A matrix format keeps reports actionable across browsers, AT combinations, and responsive breakpoints.",
      sections: [
        {
          title: "Core evidence checklist",
          points: [
            "Attach a screenshot for visual context and a short screen recording for interaction.",
            "Provide deterministic steps with preconditions and expected output.",
            "Include browser, OS, assistive technology, and device form factor."
          ]
        },
        {
          title: "Reporting format",
          points: [
            "Use one line per environment in a matrix table.",
            "Mark pass/fail per environment and link to matching assets.",
            "Keep one defect per ticket to avoid triage ambiguity."
          ]
        }
      ]
    }
  },
  {
    id: "mdn-aria-reference",
    title: "MDN ARIA Reference for Debugging Semantics",
    summary:
      "A fast lookup for roles and attributes when triaging missing semantics and announcement issues.",
    category: "guides",
    audience: ["qa", "frontend"],
    publishedAt: "2026-03-05",
    source: "MDN",
    url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA",
    readingMinutes: 7
  },
  {
    id: "webdev-accessibility",
    title: "web.dev Accessibility Collection",
    summary:
      "Implementation guides for focus management, forms, and inclusive UI patterns aligned with modern frontend stacks.",
    category: "guides",
    audience: ["frontend", "design", "qa"],
    publishedAt: "2026-02-27",
    source: "web.dev",
    url: "https://web.dev/accessibility",
    readingMinutes: 9
  },
  {
    id: "a11y-project-checklist",
    title: "A11Y Project Checklist for Release Readiness",
    summary:
      "Use this checklist as a pre-release gate to reduce regressions and enforce accessibility acceptance criteria.",
    category: "case-studies",
    audience: ["qa", "pm"],
    publishedAt: "2026-02-19",
    source: "The A11Y Project",
    url: "https://www.a11yproject.com/checklist/",
    readingMinutes: 6
  },
  {
    id: "axe-devtools-overview",
    title: "Axe DevTools: Faster Defect Discovery in CI and Browser",
    summary:
      "A tooling overview for combining automated checks with manual QA evidence for stronger reports.",
    category: "tooling",
    audience: ["qa", "frontend"],
    publishedAt: "2026-02-11",
    source: "Deque",
    url: "https://www.deque.com/axe/",
    readingMinutes: 5
  },
  {
    id: "pa11y-guide",
    title: "Pa11y for Scripted Accessibility Audits",
    summary:
      "Command-line checks you can add to smoke pipelines for fast signal before manual exploratory testing.",
    category: "tooling",
    audience: ["qa", "frontend"],
    publishedAt: "2026-01-30",
    source: "Pa11y",
    url: "https://pa11y.org/",
    readingMinutes: 5
  },
  {
    id: "nvda-user-guide",
    title: "NVDA User Guide for Reproduction Precision",
    summary:
      "Improve reproducibility by documenting exact screen reader commands and expected announcements.",
    category: "guides",
    audience: ["qa", "frontend"],
    publishedAt: "2026-01-20",
    source: "NV Access",
    url: "https://www.nvaccess.org/files/nvda/documentation/userGuide.html",
    readingMinutes: 8
  }
];

export function filterAccessibilityNewsItems(input: {
  q?: string;
  category?: string;
  audience?: string;
}) {
  const q = input.q?.trim().toLowerCase() ?? "";
  const category = (input.category?.trim().toLowerCase() ?? "") as AccessibilityNewsCategory | "";
  const audience = (input.audience?.trim().toLowerCase() ?? "") as AccessibilityNewsAudience | "";

  return ACCESSIBILITY_NEWS_ITEMS.filter((item) => {
    const matchesCategory = !category || item.category === category;
    const matchesAudience = !audience || item.audience.includes(audience);
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q);

    return matchesCategory && matchesAudience && matchesQuery;
  }).sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function getAccessibilityNewsItemById(id: string) {
  return ACCESSIBILITY_NEWS_ITEMS.find((item) => item.id === id);
}

export function getFeaturedAccessibilityNewsItems(limit = 2) {
  return [...ACCESSIBILITY_NEWS_ITEMS]
    .filter((item) => item.isFeatured)
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, limit);
}

export function getWeeklyDigestAccessibilityNewsItems(limit = 4) {
  return [...ACCESSIBILITY_NEWS_ITEMS]
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, limit);
}
