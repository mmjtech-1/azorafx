import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function readPayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  }
  return request.json();
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Missing admin client" }, { status: 500 });
  const body = await readPayload(request);
  const userId = String(body.user_id);
  const paymentId = String(body.payment_id);
  const durationDays = Number(body.duration_days ?? 30);
  const periodEnd = new Date(Date.now() + durationDays * 86400000).toISOString();

  await admin.from("subscriptions").upsert({
    user_id: userId,
    plan: "pro",
    status: "active",
    current_period_start: new Date().toISOString(),
    current_period_end: periodEnd,
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  await admin.from("manual_payments").update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user.id }).eq("id", paymentId);
  await admin.from("payments").insert({ user_id: userId, method: "manual", amount_usd: 19, status: "completed" });

  const { data: target } = await admin.from("profiles").select("email").eq("id", userId).maybeSingle();
  if (process.env.RESEND_API_KEY && target?.email) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Azora FX <billing@azoraglobal.com>",
      to: target.email,
      subject: "Your Azora FX Pro is now active!",
      text: "Your Azora FX Pro subscription is now active. Welcome to Pro.",
    });
  }

  return NextResponse.json({ ok: true, current_period_end: periodEnd });
}
