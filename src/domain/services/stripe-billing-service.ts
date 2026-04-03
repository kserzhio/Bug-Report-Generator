export type StripeLikeSubscriptionStatus =
  | "trialing"
  | "past_due"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "canceled"
  | string;

export type AppSubscriptionStatus = "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED";
export type AppSubscriptionPlan = "FREE" | "PRO";

export function mapStripeStatus(status: StripeLikeSubscriptionStatus): AppSubscriptionStatus {
  if (status === "trialing") {
    return "TRIALING";
  }

  if (status === "past_due" || status === "unpaid" || status === "incomplete" || status === "incomplete_expired") {
    return "PAST_DUE";
  }

  if (status === "canceled") {
    return "CANCELED";
  }

  return "ACTIVE";
}

export function mapPlanFromPriceId(
  priceId: string | null | undefined,
  proPriceId: string | null | undefined
): AppSubscriptionPlan {
  if (proPriceId && priceId === proPriceId) {
    return "PRO";
  }

  return "FREE";
}

export function extractWorkspaceContextFromMetadata(
  metadata: Record<string, string> | null | undefined
) {
  const userId = metadata?.userId?.trim() ?? "";
  const workspaceId = metadata?.workspaceId?.trim() ?? "";

  if (!userId || !workspaceId) {
    return null;
  }

  return {
    userId,
    workspaceId
  };
}
