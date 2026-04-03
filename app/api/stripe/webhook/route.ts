import Stripe from "stripe";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";
import { getStripeClient } from "@/lib/stripe/client";
import { extractWorkspaceContextFromMetadata, mapPlanFromPriceId, mapStripeStatus } from "@/src/domain/services/stripe-billing-service";
import { getActionMessages } from "@/src/server/i18n/action-messages";

async function upsertWorkspaceSubscription(input: {
  userId: string;
  workspaceId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  plan: "FREE" | "PRO";
  status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED";
  currentPeriodEnd?: Date | null;
}) {
  const byStripeId = input.stripeSubscriptionId
    ? await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: input.stripeSubscriptionId }
      })
    : null;

  const byScope =
    byStripeId ??
    (await prisma.subscription.findFirst({
      where: {
        userId: input.userId,
        workspaceId: input.workspaceId
      },
      orderBy: {
        createdAt: "desc"
      }
    }));

  if (byScope) {
    await prisma.subscription.update({
      where: { id: byScope.id },
      data: {
        stripeCustomerId: input.stripeCustomerId ?? null,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
        stripePriceId: input.stripePriceId ?? null,
        plan: input.plan,
        status: input.status,
        currentPeriodEnd: input.currentPeriodEnd ?? null
      }
    });

    return;
  }

  await prisma.subscription.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId,
      stripeCustomerId: input.stripeCustomerId ?? null,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      stripePriceId: input.stripePriceId ?? null,
      plan: input.plan,
      status: input.status,
      currentPeriodEnd: input.currentPeriodEnd ?? null
    }
  });
}

async function claimStripeEvent(event: Stripe.Event) {
  try {
    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
        status: "PROCESSING"
      }
    });

    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return false;
    }

    throw error;
  }
}

async function markStripeEventProcessed(event: Stripe.Event) {
  await prisma.stripeWebhookEvent.update({
    where: {
      stripeEventId: event.id
    },
    data: {
      status: "PROCESSED",
      errorMessage: null
    }
  });
}

async function markStripeEventFailed(event: Stripe.Event, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown webhook processing error";

  await prisma.stripeWebhookEvent.updateMany({
    where: {
      stripeEventId: event.id
    },
    data: {
      status: "FAILED",
      errorMessage: message
    }
  });
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !webhookSecret) {
    const messages = getActionMessages("en");
    return new Response(messages.stripeWebhookMissing, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature.", { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return new Response("Invalid Stripe signature.", { status: 400 });
  }

  try {
    const claimed = await claimStripeEvent(event);

    if (!claimed) {
      return new Response("ok", { status: 200 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const context = extractWorkspaceContextFromMetadata(session.metadata);

      if (context) {
        const stripeSubscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;
        const stripeCustomerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        await upsertWorkspaceSubscription({
          userId: context.userId,
          workspaceId: context.workspaceId,
          stripeCustomerId,
          stripeSubscriptionId,
          stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
          plan: "PRO",
          status: "ACTIVE"
        });
      }
    }

    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const context = extractWorkspaceContextFromMetadata(subscription.metadata);

      if (context) {
        const priceId = subscription.items.data[0]?.price?.id ?? null;
        const currentPeriodEnd =
          typeof subscription.current_period_end === "number"
            ? new Date(subscription.current_period_end * 1000)
            : null;

        await upsertWorkspaceSubscription({
          userId: context.userId,
          workspaceId: context.workspaceId,
          stripeCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id ?? null,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          plan: mapPlanFromPriceId(priceId, process.env.STRIPE_PRO_PRICE_ID?.trim()),
          status: mapStripeStatus(subscription.status),
          currentPeriodEnd
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      await prisma.subscription.updateMany({
        where: {
          stripeSubscriptionId: subscription.id
        },
        data: {
          status: "CANCELED",
          plan: "FREE"
        }
      });
    }

    await markStripeEventProcessed(event);
  } catch (error) {
    await markStripeEventFailed(event, error);
    return new Response("Webhook processing failed.", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
