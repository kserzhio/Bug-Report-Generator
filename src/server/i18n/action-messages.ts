import type { Locale } from "@/lib/i18n/locale";

type ActionMessages = {
  unauthorized: string;
  forbidden: string;
  aiUnavailable: string;
  stripeMissing: string;
  stripeWebhookMissing: string;
  stripeCheckoutCreated: string;
  stripePortalCreated: string;
  stripePortalUnavailable: string;
  freePlanLimit: string;
  bugUpdated: string;
  bugSavedFree: string;
  bugSavedPro: string;
  historyBugNotFound: string;
  historyBugUpdated: string;
  historyBugDuplicated: string;
  librarySaved: string;
  libraryNotFound: string;
  libraryDeleted: string;
  projectNameRequired: string;
  projectCreated: string;
  templateMainFieldsRequired: string;
  templateNotFound: string;
  templateSaveConflict: string;
  templateSaveFailed: string;
  templateUpdated: string;
  templateSaved: string;
  templateDeleted: string;
  componentSuggestionMainFieldsRequired: string;
  componentSuggestionNotFound: string;
  componentSuggestionSaveConflict: string;
  componentSuggestionSaveFailed: string;
  componentSuggestionUpdated: string;
  componentSuggestionSaved: string;
  componentSuggestionDeleted: string;
  workspaceNameRequired: string;
  unsupportedLanguage: string;
  settingsUpdated: string;
  inviteEmailRequired: string;
  inviteRoleUnsupported: string;
  inviteAlreadyMember: string;
  inviteCreated: string;
  inviteNotFound: string;
  inviteRevoked: string;
  memberNotFound: string;
  memberRoleUpdated: string;
  memberRemoved: string;
  cannotChangeOwnRole: string;
  cannotRemoveSelf: string;
  cannotDemoteLastOwner: string;
  cannotRemoveLastOwner: string;
  workspaceSwitched: string;
};

const MESSAGES: Record<Locale, ActionMessages> = {
  en: {
    unauthorized: "Unauthorized",
    forbidden: "You do not have permission to do this.",
    aiUnavailable: "AI enhancement is unavailable right now.",
    stripeMissing:
      "Stripe is not fully configured yet. Add STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, and NEXT_PUBLIC_APP_URL.",
    stripeWebhookMissing:
      "Stripe webhook is not fully configured yet. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
    stripeCheckoutCreated: "Stripe checkout created.",
    stripePortalCreated: "Stripe customer portal created.",
    stripePortalUnavailable: "No active Stripe subscription was found for this workspace.",
    freePlanLimit: "Free plan limit reached for this month. Upgrade to Pro for unlimited generations.",
    bugUpdated: "Bug report updated.",
    bugSavedFree: "Bug report saved on Free plan.",
    bugSavedPro: "Bug report saved on Pro plan.",
    historyBugNotFound: "History bug not found.",
    historyBugUpdated: "History bug updated.",
    historyBugDuplicated: "History bug duplicated.",
    librarySaved: "Saved to bug library.",
    libraryNotFound: "Library item not found.",
    libraryDeleted: "Library item deleted.",
    projectNameRequired: "Project name is required.",
    projectCreated: "Project created.",
    templateMainFieldsRequired: "Fill in the main template fields.",
    templateNotFound: "Template not found.",
    templateSaveConflict: "Could not save the template. Try another title.",
    templateSaveFailed: "Could not save the template.",
    templateUpdated: "Template updated.",
    templateSaved: "Template saved.",
    templateDeleted: "Template deleted.",
    componentSuggestionMainFieldsRequired: "Fill in title, component key, actual behavior, expected behavior, and WCAG criterion.",
    componentSuggestionNotFound: "Component issue suggestion not found.",
    componentSuggestionSaveConflict: "Could not save the component suggestion. Try another title.",
    componentSuggestionSaveFailed: "Could not save the component suggestion.",
    componentSuggestionUpdated: "Component issue suggestion updated.",
    componentSuggestionSaved: "Component issue suggestion saved.",
    componentSuggestionDeleted: "Component issue suggestion deleted.",
    workspaceNameRequired: "Workspace name is required.",
    unsupportedLanguage: "Unsupported language.",
    settingsUpdated: "Settings updated.",
    inviteEmailRequired: "Invite email is required.",
    inviteRoleUnsupported: "Unsupported invite role.",
    inviteAlreadyMember: "This user is already a workspace member.",
    inviteCreated: "Invite created.",
    inviteNotFound: "Invite not found.",
    inviteRevoked: "Invite revoked.",
    memberNotFound: "Workspace member not found.",
    memberRoleUpdated: "Member role updated.",
    memberRemoved: "Member removed.",
    cannotChangeOwnRole: "You cannot change your own role.",
    cannotRemoveSelf: "You cannot remove yourself from the workspace.",
    cannotDemoteLastOwner: "Cannot demote the last workspace owner.",
    cannotRemoveLastOwner: "Cannot remove the last workspace owner.",
    workspaceSwitched: "Workspace switched."
  },
  uk: {
    unauthorized: "Неавторизовано",
    forbidden: "У вас немає прав для цієї дії.",
    aiUnavailable: "AI-покращення зараз недоступне.",
    stripeMissing:
      "Stripe налаштовано не повністю. Додайте STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID та NEXT_PUBLIC_APP_URL.",
    stripeWebhookMissing:
      "Stripe webhook налаштовано не повністю. Додайте STRIPE_SECRET_KEY та STRIPE_WEBHOOK_SECRET.",
    stripeCheckoutCreated: "Stripe checkout створено.",
    stripePortalCreated: "Stripe customer portal створено.",
    stripePortalUnavailable: "Для цього workspace не знайдено активної Stripe-підписки.",
    freePlanLimit: "Ліміт безкоштовного плану вичерпано на цей місяць. Оновіться до Pro для безлімітних генерацій.",
    bugUpdated: "Bug-репорт оновлено.",
    bugSavedFree: "Bug-репорт збережено у безкоштовному плані.",
    bugSavedPro: "Bug-репорт збережено у плані Pro.",
    historyBugNotFound: "Баг в історії не знайдено.",
    historyBugUpdated: "Баг в історії оновлено.",
    historyBugDuplicated: "Баг продубльовано.",
    librarySaved: "Збережено у бібліотеку багів.",
    libraryNotFound: "Елемент бібліотеки не знайдено.",
    libraryDeleted: "Елемент бібліотеки видалено.",
    projectNameRequired: "Потрібна назва проєкту.",
    projectCreated: "Проєкт створено.",
    templateMainFieldsRequired: "Заповніть основні поля шаблону.",
    templateNotFound: "Шаблон не знайдено.",
    templateSaveConflict: "Не вдалося зберегти шаблон. Спробуйте іншу назву.",
    templateSaveFailed: "Не вдалося зберегти шаблон.",
    templateUpdated: "Шаблон оновлено.",
    templateSaved: "Шаблон збережено.",
    templateDeleted: "Шаблон видалено.",
    componentSuggestionMainFieldsRequired: "Заповніть title, component key, actual behavior, expected behavior та WCAG criterion.",
    componentSuggestionNotFound: "Підказку проблеми компонента не знайдено.",
    componentSuggestionSaveConflict: "Не вдалося зберегти підказку компонента. Спробуйте іншу назву.",
    componentSuggestionSaveFailed: "Не вдалося зберегти підказку компонента.",
    componentSuggestionUpdated: "Підказку проблеми компонента оновлено.",
    componentSuggestionSaved: "Підказку проблеми компонента збережено.",
    componentSuggestionDeleted: "Підказку проблеми компонента видалено.",
    workspaceNameRequired: "Потрібна назва workspace.",
    unsupportedLanguage: "Непідтримувана мова.",
    settingsUpdated: "Налаштування оновлено.",
    inviteEmailRequired: "Потрібен email для запрошення.",
    inviteRoleUnsupported: "Непідтримувана роль для запрошення.",
    inviteAlreadyMember: "Цей користувач вже є учасником workspace.",
    inviteCreated: "Запрошення створено.",
    inviteNotFound: "Запрошення не знайдено.",
    inviteRevoked: "Запрошення скасовано.",
    memberNotFound: "Учасника workspace не знайдено.",
    memberRoleUpdated: "Роль учасника оновлено.",
    memberRemoved: "Учасника видалено.",
    cannotChangeOwnRole: "Ви не можете змінити власну роль.",
    cannotRemoveSelf: "Ви не можете видалити себе з workspace.",
    cannotDemoteLastOwner: "Не можна понизити останнього owner workspace.",
    cannotRemoveLastOwner: "Не можна видалити останнього owner workspace.",
    workspaceSwitched: "Workspace перемкнено."
  }
};

export function getActionMessages(locale: Locale) {
  return MESSAGES[locale];
}
