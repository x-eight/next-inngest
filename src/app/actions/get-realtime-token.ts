"use server";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken } from "@inngest/realtime";

/**
 * Returns an Inngest Realtime subscription token scoped to a specific
 * workflow channel ("workflow:<schemeId>") and the "steps" topic.
 *
 * This runs on the server so the signing key is never exposed to the browser.
 */
export async function fetchRealtimeToken(schemeId: string) {
  const token = await getSubscriptionToken(inngest, {
    channel: `workflow:${schemeId}`,
    topics: ["steps"],
  });
  return token;
}
