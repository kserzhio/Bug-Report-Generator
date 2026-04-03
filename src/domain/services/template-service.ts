import type { BugTemplateSeed } from "@/src/domain/entities/template";
import type { GeneratorFormValues } from "@/src/validation/generator";

export function applyTemplateToForm(
  template: Partial<GeneratorFormValues>,
  currentValues: GeneratorFormValues
): GeneratorFormValues {
  return {
    ...currentValues,
    ...template
  };
}

export const defaultTemplateSeeds: BugTemplateSeed[] = [
  {
    title: "Missing accessible name",
    slug: "missing-accessible-name",
    category: "forms",
    description: "Interactive element is missing a programmatic accessible name.",
    actualBehavior:
      "The input field is announced without a useful accessible name, making its purpose unclear to screen reader users.",
    expectedBehavior:
      "The control should expose a clear, programmatic accessible name that matches the visible context or label.",
    wcagCriterion: "1.3.1 Info and Relationships, 4.1.2 Name, Role, Value",
    toolsUsed: "NVDA, Chrome DevTools Accessibility Tree",
    severity: "High"
  },
  {
    title: "Dialog not announced",
    slug: "dialog-not-announced",
    category: "dialogs",
    description: "A dialog opens but is not announced as a dialog.",
    actualBehavior:
      "When the modal opens, focus changes visually but assistive technologies do not announce the dialog title or role.",
    expectedBehavior:
      "The dialog should move focus inside, expose role=dialog or alertdialog, and announce its accessible name.",
    wcagCriterion: "2.4.3 Focus Order, 4.1.2 Name, Role, Value",
    toolsUsed: "VoiceOver, Accessibility Inspector",
    severity: "Critical"
  },
  {
    title: "Focus not visible",
    slug: "focus-not-visible",
    category: "keyboard",
    description: "Keyboard focus indicator is absent or too subtle.",
    actualBehavior:
      "Keyboard users can tab to the control, but the current focus state is not visually discernible.",
    expectedBehavior:
      "A strong, visible focus indicator should appear whenever the component receives keyboard focus.",
    wcagCriterion: "2.4.7 Focus Visible",
    toolsUsed: "Keyboard-only testing, Axe DevTools",
    severity: "High"
  },
  {
    title: "Incorrect heading structure",
    slug: "incorrect-heading-structure",
    category: "navigation",
    description: "Heading levels skip or do not represent the page structure.",
    actualBehavior:
      "The page heading sequence skips levels, causing an inconsistent outline for screen reader users.",
    expectedBehavior:
      "Headings should follow a meaningful hierarchy that accurately reflects content structure.",
    wcagCriterion: "1.3.1 Info and Relationships, 2.4.6 Headings and Labels",
    toolsUsed: "HeadingsMap, NVDA",
    severity: "Medium"
  },
  {
    title: "Status message not announced",
    slug: "status-message-not-announced",
    category: "status-messages",
    description: "Dynamically updated status message is not announced.",
    actualBehavior:
      "After form submission, the success or error status appears visually but is not announced by assistive technologies.",
    expectedBehavior:
      "The status message should be exposed via a suitable live region so users are informed without moving focus.",
    wcagCriterion: "4.1.3 Status Messages",
    toolsUsed: "NVDA, Chrome Accessibility pane",
    severity: "High"
  },
  {
    title: "Expand/collapse state not announced",
    slug: "expand-collapse-state-not-announced",
    category: "screen-reader",
    description: "Accordion or disclosure state is not exposed properly.",
    actualBehavior:
      "When the trigger is toggled, the expanded or collapsed state is not communicated to assistive technologies.",
    expectedBehavior:
      "The trigger should expose aria-expanded and remain programmatically associated with the controlled content.",
    wcagCriterion: "4.1.2 Name, Role, Value",
    toolsUsed: "JAWS, Accessibility Tree",
    severity: "Medium"
  },
  {
    title: "aria-invalid error not associated",
    slug: "aria-invalid-error-not-associated",
    category: "forms",
    description: "Validation error text is not associated with the invalid field.",
    actualBehavior:
      "The form field indicates an invalid state, but screen reader users do not receive the related error guidance.",
    expectedBehavior:
      "The invalid field should reference the error text using aria-describedby or an equivalent relationship.",
    wcagCriterion: "3.3.1 Error Identification, 3.3.3 Error Suggestion",
    toolsUsed: "NVDA, form validation testing",
    severity: "High"
  },
  {
    title: "Change of context on input",
    slug: "change-of-context-on-input",
    category: "forms",
    description: "Input selection unexpectedly triggers navigation or other context change.",
    actualBehavior:
      "Selecting an option immediately navigates the user away without warning or a submit action.",
    expectedBehavior:
      "Changes of context should not occur on input alone unless users are clearly warned in advance.",
    wcagCriterion: "3.2.2 On Input",
    toolsUsed: "Keyboard testing, manual UX review",
    severity: "Medium"
  }
];
