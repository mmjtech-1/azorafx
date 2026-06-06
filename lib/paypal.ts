const PAYPAL_API = process.env.PAYPAL_API_BASE ?? "https://api-m.paypal.com";
const PRICE_USD = "19.00";

async function paypalFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  return fetch(`${PAYPAL_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
}

export async function getAccessToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Missing PayPal credentials");
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error("PayPal authentication failed");
  const payload = await response.json();
  return payload.access_token as string;
}

export async function createSubscription(userId: string, email: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fx.azoraglobal.com";
  const planId = process.env.PAYPAL_PRO_PLAN_ID;
  if (!planId) {
    return {
      id: "manual-plan",
      approvalUrl: `${appUrl}/dashboard/billing?paypal=configure-plan`,
    };
  }
  const response = await paypalFetch("/v1/billing/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      custom_id: userId,
      subscriber: { email_address: email },
      application_context: {
        brand_name: "Azora FX",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${appUrl}/dashboard/billing?paypal=success`,
        cancel_url: `${appUrl}/pricing?paypal=cancelled`,
      },
    }),
  });
  if (!response.ok) throw new Error("PayPal subscription creation failed");
  const payload = await response.json();
  const approvalUrl = payload.links?.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;
  return { id: payload.id as string, approvalUrl: approvalUrl as string };
}

export async function cancelSubscription(subscriptionId: string) {
  const response = await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason: "User requested cancellation" }),
  });
  if (!response.ok) throw new Error("PayPal cancellation failed");
}

export async function verifyWebhook(headers: Headers, body: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return true;
  const response = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: body,
    }),
  });
  if (!response.ok) return false;
  const payload = await response.json();
  return payload.verification_status === "SUCCESS";
}

export const paypalPriceUsd = Number(PRICE_USD);
