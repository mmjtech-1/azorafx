import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhook } from "@/lib/paypal";

function periodEnd(days = 30) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const verified = await verifyWebhook(request.headers, body);
  if (!verified) return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Missing admin client" }, { status: 500 });

  const eventType = body.event_type as string;
  const resource = body.resource ?? {};
  const userId = resource.custom_id ?? resource.subscriber?.payer_id;
  const subscriptionId = resource.id ?? resource.billing_agreement_id;

  if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED" && userId) {
    await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan: "pro",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd(30),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  }

  if (eventType === "BILLING.SUBSCRIPTION.CANCELLED" && userId) {
    await supabase.from("subscriptions").update({ status: "canceled", cancel_at_period_end: true, updated_at: new Date().toISOString() }).eq("user_id", userId);
  }

  if (eventType === "PAYMENT.SALE.COMPLETED" && userId) {
    await supabase.from("payments").insert({ user_id: userId, method: "paypal", amount_usd: Number(resource.amount?.total ?? 19), status: "completed", paypal_subscription_id: subscriptionId });
  }

  return NextResponse.json({ ok: true });
}

