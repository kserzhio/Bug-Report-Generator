import type { GeneratorFormValues } from "@/src/validation/generator";

export function expandShortNote(
  shortNote: string,
  currentValues: GeneratorFormValues
): Partial<GeneratorFormValues> {
  const note = shortNote.trim();
  const lower = note.toLowerCase();

  if (!note) {
    return {};
  }

  if (lower.includes("hover") && lower.includes("tooltip")) {
    return {
      component: currentValues.component || "Tooltip trigger",
      affectedUsers: currentValues.affectedUsers || "Keyboard and touch users",
      actualBehavior:
        "The tooltip content is available only on pointer hover and does not appear when the trigger receives keyboard focus.",
      expectedBehavior:
        "The tooltip should also appear on keyboard focus, remain dismissible, and not block adjacent content.",
      wcagCriterion: "1.4.13 Content on Hover or Focus",
      notes: note
    };
  }

  if (lower.includes("modal") || lower.includes("dialog")) {
    return {
      component: currentValues.component || "Modal dialog",
      affectedUsers: currentValues.affectedUsers || "Keyboard and screen reader users",
      actualBehavior: `The dialog has the following issue: ${note}. This prevents users from interacting with the modal reliably using assistive technology or keyboard navigation.`,
      expectedBehavior:
        "The dialog should announce itself correctly, move focus inside when opened, and preserve an expected keyboard interaction model.",
      notes: note
    };
  }

  return {
    actualBehavior: `Observed issue: ${note}. The current implementation creates an accessibility barrier for affected users.`,
    expectedBehavior:
      "The affected component should behave consistently for keyboard, screen reader, and low-vision users without creating hidden or missing states.",
    notes: note
  };
}
