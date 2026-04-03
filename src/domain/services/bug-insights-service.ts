import type { GeneratorFormValues } from "@/src/validation/generator";

type InsightRule = {
  id: string;
  keywords: string[];
  componentKeywords?: string[];
  wcag: string;
  level: "A" | "AA" | "AAA";
  problem: string;
  whyItMatters: string;
  howToFix: string[];
  codeExample: string;
};

const RULES: InsightRule[] = [
  {
    id: "missing-name",
    keywords: ["accessible name", "name missing", "label missing", "unnamed", "no label"],
    componentKeywords: ["button", "input", "form", "search", "field"],
    wcag: "1.3.1 Info and Relationships; 4.1.2 Name, Role, Value",
    level: "A",
    problem: "The control does not expose a reliable accessible name.",
    whyItMatters: "Screen reader users may not understand the control purpose, which blocks form completion and navigation.",
    howToFix: [
      "Associate a visible label using `label` + `for` or `aria-labelledby`.",
      "Use `aria-label` only when there is no visible text label.",
      "Keep the accessible name aligned with the visible text users see on screen."
    ],
    codeExample: `<label for="email">Email address</label>\n<input id="email" name="email" type="email" />`
  },
  {
    id: "dialog-announcement",
    keywords: ["dialog not announced", "modal not announced", "no aria-labelledby", "focus trap", "esc not working"],
    componentKeywords: ["dialog", "modal"],
    wcag: "2.1.2 No Keyboard Trap; 2.4.3 Focus Order; 4.1.2 Name, Role, Value",
    level: "A",
    problem: "The dialog behavior is incomplete for assistive technology and keyboard users.",
    whyItMatters: "Users may not realize a dialog opened, may lose focus context, or become trapped without a clear way to dismiss it.",
    howToFix: [
      "Move focus into the dialog when it opens.",
      "Expose `role=\"dialog\"` and connect the title with `aria-labelledby`.",
      "Trap focus inside while open and support Escape to close when appropriate."
    ],
    codeExample: `<div role="dialog" aria-modal="true" aria-labelledby="confirm-title">\n  <h2 id="confirm-title">Confirm deletion</h2>\n  ...\n</div>`
  },
  {
    id: "focus-visible",
    keywords: ["focus not visible", "no focus", "outline removed", "keyboard focus"],
    componentKeywords: ["button", "link", "input", "modal", "navigation"],
    wcag: "2.4.7 Focus Visible",
    level: "AA",
    problem: "Keyboard focus is not visually communicated clearly enough.",
    whyItMatters: "Keyboard users can lose track of their current position and may be unable to continue navigation confidently.",
    howToFix: [
      "Add a strong visible focus style that meets contrast and visibility expectations.",
      "Avoid removing outlines unless you replace them with an equally clear focus indicator.",
      "Test focus states across mouse, keyboard, and high contrast scenarios."
    ],
    codeExample: `.focus-ring:focus-visible {\n  outline: 3px solid #0ea5e9;\n  outline-offset: 2px;\n}`
  },
  {
    id: "status-message",
    keywords: ["status message", "success message", "error message", "not announced"],
    componentKeywords: ["form", "toast", "notification"],
    wcag: "4.1.3 Status Messages",
    level: "AA",
    problem: "The page updates status text visually, but assistive technologies are not notified.",
    whyItMatters: "Users who cannot see the screen changes may miss critical confirmation or error feedback.",
    howToFix: [
      "Expose the message in a polite or assertive live region depending on urgency.",
      "Do not move focus unless the workflow truly requires it.",
      "Ensure the text content updates after the live region is mounted."
    ],
    codeExample: `<div aria-live="polite" role="status">Profile saved successfully.</div>`
  },
  {
    id: "aria-invalid",
    keywords: ["aria-invalid", "error not associated", "validation error", "invalid field"],
    componentKeywords: ["form", "input", "field"],
    wcag: "3.3.1 Error Identification; 3.3.3 Error Suggestion",
    level: "A",
    problem: "The error state is not programmatically tied to the affected field.",
    whyItMatters: "Screen reader users may know a field is invalid but still not hear the error details needed to recover.",
    howToFix: [
      "Set `aria-invalid=\"true\"` only when the field actually has an error.",
      "Reference the visible error text using `aria-describedby`.",
      "Provide specific recovery guidance in the error message."
    ],
    codeExample: `<input aria-invalid="true" aria-describedby="email-error" />\n<p id="email-error">Enter a valid email address.</p>`
  },
  {
    id: "heading-structure",
    keywords: ["heading structure", "heading levels", "skip heading", "outline"],
    componentKeywords: ["page", "navigation", "content"],
    wcag: "1.3.1 Info and Relationships; 2.4.6 Headings and Labels",
    level: "AA",
    problem: "The heading hierarchy does not reflect the page structure clearly.",
    whyItMatters: "Assistive technology users often navigate by headings and depend on a logical outline to understand content quickly.",
    howToFix: [
      "Use one descriptive `h1` per page or view.",
      "Avoid skipping heading levels unless a valid structure still exists.",
      "Match heading semantics to the visual and informational hierarchy."
    ],
    codeExample: `<h1>Account settings</h1>\n<h2>Profile</h2>\n<h2>Notifications</h2>`
  }
];

function normalize(values: GeneratorFormValues) {
  return [
    values.component,
    values.actualBehavior,
    values.expectedBehavior,
    values.notes,
    values.screenName,
    values.affectedUsers
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export type GeneratedInsight = {
  suggestedWcag: string;
  suggestedLevel: "A" | "AA" | "AAA";
  problem: string;
  whyItMatters: string;
  howToFix: string[];
  codeExample: string;
  matchedRuleIds: string[];
  confidenceScore: number;
};

export function generateInsights(values: GeneratorFormValues): GeneratedInsight {
  const haystack = normalize(values);
  const component = values.component.toLowerCase();

  const matchedRules = RULES.filter((rule) => {
    const keywordMatch = rule.keywords.some((keyword) => haystack.includes(keyword));
    const componentMatch = rule.componentKeywords?.some((keyword) => component.includes(keyword));
    return keywordMatch || componentMatch;
  });

  if (matchedRules.length === 0) {
    return {
      suggestedWcag: values.wcagCriterion || "4.1.2 Name, Role, Value",
      suggestedLevel: "A",
      problem: "The issue needs a more specific pattern match before a stronger suggestion can be made.",
      whyItMatters: "Even when the exact pattern is unclear, documenting who is affected and what breaks is still valuable for engineering teams.",
      howToFix: [
        "Describe the user impact in concrete terms.",
        "Verify keyboard, screen reader, and focus behavior manually.",
        "Choose the closest WCAG criterion and override it if needed."
      ],
      codeExample: `<!-- Add the specific semantic, focus, or ARIA fix that matches the affected component -->`,
      matchedRuleIds: [],
      confidenceScore: 0.35
    };
  }

  const wcag = Array.from(new Set(matchedRules.map((rule) => rule.wcag))).join("; ");
  const level = matchedRules.some((rule) => rule.level === "AA") ? "AA" : matchedRules[0].level;
  const confidenceScore = Math.min(0.55 + matchedRules.length * 0.12, 0.93);

  return {
    suggestedWcag: wcag,
    suggestedLevel: level,
    problem: matchedRules.map((rule) => rule.problem).join(" "),
    whyItMatters: matchedRules.map((rule) => rule.whyItMatters).join(" "),
    howToFix: Array.from(new Set(matchedRules.flatMap((rule) => rule.howToFix))),
    codeExample: matchedRules.map((rule) => rule.codeExample).join("\n\n"),
    matchedRuleIds: matchedRules.map((rule) => rule.id),
    confidenceScore
  };
}

export function toPlainTextReport(values: GeneratorFormValues) {
  return [
    `Severity: ${values.severity}`,
    `Defect Description: ${values.actualBehavior}`,
    `Actual Result: ${values.actualBehavior}`,
    `Expected Result: ${values.expectedBehavior}`,
    `WCAG Criteria: WCAG ${values.wcagVersion} - ${values.wcagCriterion}`,
    `Tools Used: ${values.toolsUsed}`,
    `Screen Name: ${values.screenName}`,
    `Reproduction Steps: ${values.reproductionSteps || "N/A"}`,
    `Browser: ${values.browserInfo || "N/A"}`,
    `OS: ${values.operatingSystem || "N/A"}`,
    `Device: ${values.deviceInfo || "N/A"}`,
    `Assistive Technology: ${values.assistiveTechnology || "N/A"}`,
    `Video URL: ${values.videoUrl || "N/A"}`,
    `Screenshot URLs: ${values.screenshotUrls || "N/A"}`,
    `Notes: ${values.notes || "N/A"}`
  ].join("\n\n");
}

export function toCsvRow(values: GeneratorFormValues) {
  const escape = (value: string | undefined) => `"${(value ?? "").replaceAll('"', '""')}"`;
  const headers = [
    "severity",
    "issueType",
    "component",
    "screenName",
    "affectedUsers",
    "actualBehavior",
    "expectedBehavior",
    "wcagCriterion",
    "toolsUsed",
    "reproductionSteps",
    "browserInfo",
    "operatingSystem",
    "deviceInfo",
    "assistiveTechnology",
    "videoUrl",
    "screenshotUrls",
    "notes"
  ];
  const row = [
    values.severity,
    values.issueType,
    values.component,
    values.screenName,
    values.affectedUsers,
    values.actualBehavior,
    values.expectedBehavior,
    `WCAG ${values.wcagVersion} - ${values.wcagCriterion}`,
    values.toolsUsed,
    values.reproductionSteps ?? "",
    values.browserInfo ?? "",
    values.operatingSystem ?? "",
    values.deviceInfo ?? "",
    values.assistiveTechnology ?? "",
    values.videoUrl ?? "",
    values.screenshotUrls ?? "",
    values.notes ?? ""
  ].map(escape);

  return `${headers.join(",")}\n${row.join(",")}`;
}
