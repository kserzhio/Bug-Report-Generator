export type ComponentIssueSeed = {
  slug: string;
  componentKey: string;
  category: string;
  tags: string[];
  title: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  affectedUsers: string;
  actualBehavior: string;
  expectedBehavior: string;
  wcagCriterion: string;
  notes: string;
};

export const defaultComponentIssueSeeds: ComponentIssueSeed[] = [
  {
    slug: "modal-focus-trap-missing",
    componentKey: "modal",
    category: "dialogs",
    tags: ["focus", "keyboard", "modal"],
    title: "Focus trap missing",
    severity: "Critical",
    affectedUsers: "Keyboard and screen reader users",
    actualBehavior:
      "When the modal opens, keyboard focus can move behind the dialog and escape into the page content.",
    expectedBehavior:
      "Focus should remain trapped within the modal while it is open and return to the triggering control when closed.",
    wcagCriterion: "2.1.2 No Keyboard Trap; 2.4.3 Focus Order",
    notes: "Verify Tab, Shift+Tab, and Escape behavior."
  },
  {
    slug: "modal-dialog-not-announced",
    componentKey: "modal",
    category: "screen-reader",
    tags: ["screen-reader", "aria", "dialogs"],
    title: "Dialog not announced",
    severity: "High",
    affectedUsers: "Screen reader users",
    actualBehavior:
      "The modal opens visually, but its role and title are not announced by assistive technologies.",
    expectedBehavior:
      "The modal should expose a dialog role and accessible name that are announced when it opens.",
    wcagCriterion: "4.1.2 Name, Role, Value",
    notes: "Check role=dialog and aria-labelledby wiring."
  },
  {
    slug: "dialog-escape-does-not-close",
    componentKey: "dialog",
    category: "keyboard",
    tags: ["keyboard", "dialogs"],
    title: "Escape key does not close dialog",
    severity: "Medium",
    affectedUsers: "Keyboard users",
    actualBehavior:
      "Pressing Escape does not dismiss the dialog when the pattern expects keyboard dismissal.",
    expectedBehavior:
      "Escape should close the dialog and move focus back to the triggering element when appropriate.",
    wcagCriterion: "2.1.1 Keyboard",
    notes: "Confirm the design expects keyboard dismissal."
  },
  {
    slug: "form-error-not-associated",
    componentKey: "form",
    category: "forms",
    tags: ["forms", "aria", "validation"],
    title: "Error message not associated with field",
    severity: "High",
    affectedUsers: "Screen reader users",
    actualBehavior:
      "Validation text appears visually, but the invalid field is not programmatically associated with the error message.",
    expectedBehavior:
      "The invalid field should expose the error text via aria-describedby and an invalid state when appropriate.",
    wcagCriterion: "3.3.1 Error Identification; 3.3.3 Error Suggestion",
    notes: "Check aria-invalid and aria-describedby usage."
  },
  {
    slug: "form-change-of-context-on-input",
    componentKey: "form",
    category: "forms",
    tags: ["forms", "interaction"],
    title: "Change of context on input",
    severity: "Medium",
    affectedUsers: "Keyboard and screen reader users",
    actualBehavior:
      "Selecting or editing a form control unexpectedly changes the page context without an explicit submit action.",
    expectedBehavior:
      "Changes of context should not happen on input alone unless users are warned in advance.",
    wcagCriterion: "3.2.2 On Input",
    notes: "Common with auto-submit select fields."
  },
  {
    slug: "table-header-association-missing",
    componentKey: "table",
    category: "tables",
    tags: ["tables", "semantics", "screen-reader"],
    title: "Header association missing",
    severity: "High",
    affectedUsers: "Screen reader users",
    actualBehavior: "Table cells are announced without enough row or column header context.",
    expectedBehavior: "Data cells should be programmatically associated with the correct headers.",
    wcagCriterion: "1.3.1 Info and Relationships",
    notes: "Check th scope, headers/id, and table semantics."
  },
  {
    slug: "navigation-focus-order-breaks",
    componentKey: "navigation",
    category: "navigation",
    tags: ["navigation", "focus", "keyboard"],
    title: "Focus order breaks in navigation",
    severity: "High",
    affectedUsers: "Keyboard users",
    actualBehavior:
      "The navigation order is inconsistent and focus moves in a sequence that does not match the visible interface.",
    expectedBehavior:
      "Focus should move through the navigation in a logical order that matches the visual and DOM order.",
    wcagCriterion: "2.4.3 Focus Order",
    notes: "Check menus, drawers, and skip links."
  },
  {
    slug: "tooltip-hover-only",
    componentKey: "tooltip",
    category: "content-structure",
    tags: ["tooltip", "hover", "focus"],
    title: "Tooltip works only on hover",
    severity: "Medium",
    affectedUsers: "Keyboard and touch users",
    actualBehavior:
      "The tooltip appears only on pointer hover and is not available from keyboard focus.",
    expectedBehavior:
      "Tooltip content should also become available when the trigger receives keyboard focus.",
    wcagCriterion: "1.4.13 Content on Hover or Focus",
    notes: "Check focus behavior and dismissibility."
  }
];
