type WcagLevel = "A" | "AA" | "AAA";
export type WcagVersion = "2.1" | "2.2";

type Criterion = {
  code: string;
  title: string;
  level: WcagLevel;
};

function formatCriterion(criterion: Criterion) {
  return `${criterion.code} ${criterion.title}`;
}

const WCAG_21_CRITERIA: Criterion[] = [
  { code: "1.1.1", title: "Non-text Content", level: "A" },
  { code: "1.2.1", title: "Audio-only and Video-only (Prerecorded)", level: "A" },
  { code: "1.2.2", title: "Captions (Prerecorded)", level: "A" },
  { code: "1.2.3", title: "Audio Description or Media Alternative (Prerecorded)", level: "A" },
  { code: "1.2.4", title: "Captions (Live)", level: "AA" },
  { code: "1.2.5", title: "Audio Description (Prerecorded)", level: "AA" },
  { code: "1.2.6", title: "Sign Language (Prerecorded)", level: "AAA" },
  { code: "1.2.7", title: "Extended Audio Description (Prerecorded)", level: "AAA" },
  { code: "1.2.8", title: "Media Alternative (Prerecorded)", level: "AAA" },
  { code: "1.2.9", title: "Audio-only (Live)", level: "AAA" },
  { code: "1.3.1", title: "Info and Relationships", level: "A" },
  { code: "1.3.2", title: "Meaningful Sequence", level: "A" },
  { code: "1.3.3", title: "Sensory Characteristics", level: "A" },
  { code: "1.3.4", title: "Orientation", level: "AA" },
  { code: "1.3.5", title: "Identify Input Purpose", level: "AA" },
  { code: "1.3.6", title: "Identify Purpose", level: "AAA" },
  { code: "1.4.1", title: "Use of Color", level: "A" },
  { code: "1.4.2", title: "Audio Control", level: "A" },
  { code: "1.4.3", title: "Contrast (Minimum)", level: "AA" },
  { code: "1.4.4", title: "Resize Text", level: "AA" },
  { code: "1.4.5", title: "Images of Text", level: "AA" },
  { code: "1.4.6", title: "Contrast (Enhanced)", level: "AAA" },
  { code: "1.4.7", title: "Low or No Background Audio", level: "AAA" },
  { code: "1.4.8", title: "Visual Presentation", level: "AAA" },
  { code: "1.4.9", title: "Images of Text (No Exception)", level: "AAA" },
  { code: "1.4.10", title: "Reflow", level: "AA" },
  { code: "1.4.11", title: "Non-text Contrast", level: "AA" },
  { code: "1.4.12", title: "Text Spacing", level: "AA" },
  { code: "1.4.13", title: "Content on Hover or Focus", level: "AA" },
  { code: "2.1.1", title: "Keyboard", level: "A" },
  { code: "2.1.2", title: "No Keyboard Trap", level: "A" },
  { code: "2.1.3", title: "Keyboard (No Exception)", level: "AAA" },
  { code: "2.1.4", title: "Character Key Shortcuts", level: "A" },
  { code: "2.2.1", title: "Timing Adjustable", level: "A" },
  { code: "2.2.2", title: "Pause, Stop, Hide", level: "A" },
  { code: "2.2.3", title: "No Timing", level: "AAA" },
  { code: "2.2.4", title: "Interruptions", level: "AAA" },
  { code: "2.2.5", title: "Re-authenticating", level: "AAA" },
  { code: "2.2.6", title: "Timeouts", level: "AAA" },
  { code: "2.3.1", title: "Three Flashes or Below Threshold", level: "A" },
  { code: "2.3.2", title: "Three Flashes", level: "AAA" },
  { code: "2.3.3", title: "Animation from Interactions", level: "AAA" },
  { code: "2.4.1", title: "Bypass Blocks", level: "A" },
  { code: "2.4.2", title: "Page Titled", level: "A" },
  { code: "2.4.3", title: "Focus Order", level: "A" },
  { code: "2.4.4", title: "Link Purpose (In Context)", level: "A" },
  { code: "2.4.5", title: "Multiple Ways", level: "AA" },
  { code: "2.4.6", title: "Headings and Labels", level: "AA" },
  { code: "2.4.7", title: "Focus Visible", level: "AA" },
  { code: "2.4.8", title: "Location", level: "AAA" },
  { code: "2.4.9", title: "Link Purpose (Link Only)", level: "AAA" },
  { code: "2.4.10", title: "Section Headings", level: "AAA" },
  { code: "2.5.1", title: "Pointer Gestures", level: "A" },
  { code: "2.5.2", title: "Pointer Cancellation", level: "A" },
  { code: "2.5.3", title: "Label in Name", level: "A" },
  { code: "2.5.4", title: "Motion Actuation", level: "A" },
  { code: "2.5.5", title: "Target Size (Enhanced)", level: "AAA" },
  { code: "2.5.6", title: "Concurrent Input Mechanisms", level: "AAA" },
  { code: "3.1.1", title: "Language of Page", level: "A" },
  { code: "3.1.2", title: "Language of Parts", level: "AA" },
  { code: "3.1.3", title: "Unusual Words", level: "AAA" },
  { code: "3.1.4", title: "Abbreviations", level: "AAA" },
  { code: "3.1.5", title: "Reading Level", level: "AAA" },
  { code: "3.1.6", title: "Pronunciation", level: "AAA" },
  { code: "3.2.1", title: "On Focus", level: "A" },
  { code: "3.2.2", title: "On Input", level: "A" },
  { code: "3.2.3", title: "Consistent Navigation", level: "AA" },
  { code: "3.2.4", title: "Consistent Identification", level: "AA" },
  { code: "3.2.5", title: "Change on Request", level: "AAA" },
  { code: "3.3.1", title: "Error Identification", level: "A" },
  { code: "3.3.2", title: "Labels or Instructions", level: "A" },
  { code: "3.3.3", title: "Error Suggestion", level: "AA" },
  { code: "3.3.4", title: "Error Prevention (Legal, Financial, Data)", level: "AA" },
  { code: "3.3.5", title: "Help", level: "AAA" },
  { code: "3.3.6", title: "Error Prevention (All)", level: "AAA" },
  { code: "4.1.1", title: "Parsing", level: "A" },
  { code: "4.1.2", title: "Name, Role, Value", level: "A" },
  { code: "4.1.3", title: "Status Messages", level: "AA" }
];

const WCAG_22_ONLY: Criterion[] = [
  { code: "2.4.11", title: "Focus Not Obscured (Minimum)", level: "AA" },
  { code: "2.4.12", title: "Focus Not Obscured (Enhanced)", level: "AAA" },
  { code: "2.4.13", title: "Focus Appearance", level: "AAA" },
  { code: "2.5.7", title: "Dragging Movements", level: "AA" },
  { code: "2.5.8", title: "Target Size (Minimum)", level: "AA" },
  { code: "3.2.6", title: "Consistent Help", level: "A" },
  { code: "3.3.7", title: "Redundant Entry", level: "A" },
  { code: "3.3.8", title: "Accessible Authentication (Minimum)", level: "AA" },
  { code: "3.3.9", title: "Accessible Authentication (Enhanced)", level: "AAA" }
];

const WCAG_22_CRITERIA: Criterion[] = [
  ...WCAG_21_CRITERIA.filter((criterion) => criterion.code !== "4.1.1"),
  ...WCAG_22_ONLY
].sort((left, right) => left.code.localeCompare(right.code, undefined, { numeric: true }));

export const WCAG_VERSION_OPTIONS = [
  { label: "WCAG 2.1", value: "2.1" },
  { label: "WCAG 2.2", value: "2.2" }
] as const;

const VERSION_MAP: Record<WcagVersion, Criterion[]> = {
  "2.1": WCAG_21_CRITERIA,
  "2.2": WCAG_22_CRITERIA
};

const VERSION_CODE_SETS: Record<WcagVersion, Set<string>> = {
  "2.1": new Set(WCAG_21_CRITERIA.map((criterion) => criterion.code)),
  "2.2": new Set(WCAG_22_CRITERIA.map((criterion) => criterion.code))
};

export function inferWcagVersion(currentValue?: string | null): WcagVersion {
  const code = currentValue?.match(/^\d+\.\d+\.\d+/)?.[0];

  if (!code) {
    return "2.2";
  }

  if (code === "4.1.1") {
    return "2.1";
  }

  if (new Set(WCAG_22_ONLY.map((criterion) => criterion.code)).has(code)) {
    return "2.2";
  }

  return "2.2";
}

export function getWcagCriterionOptions(version: WcagVersion, currentValue?: string | null) {
  const criteria = VERSION_MAP[version];
  const options = criteria.map((criterion) => ({
    value: formatCriterion(criterion),
    label: `${criterion.code} ${criterion.title} (${criterion.level})`
  }));

  if (!currentValue) {
    return options;
  }

  const code = currentValue.match(/^\d+\.\d+\.\d+/)?.[0];
  const existsInVersion = code ? VERSION_CODE_SETS[version].has(code) : options.some((option) => option.value === currentValue);

  if (existsInVersion || options.some((option) => option.value === currentValue)) {
    return options;
  }

  return [{ value: currentValue, label: `${currentValue} (saved value)` }, ...options];
}
