import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase
    .from("manual_payments")
    .insert({
      user_id: user.id,
      method: body.method,
      transaction_id: body.transaction_id,
      screenshot_url: body.screenshot_url,
      amount_usd: body.amount_usd ?? 19,
      amount_pkr: body.amount_pkr,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "Unable to save payment proof" }, { status: 500 });

  if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Azora FX <billing@azoraglobal.com>",
      to: process.env.ADMIN_EMAIL,
      subject: "New payment proof submitted",
      text: `New payment proof submitted by ${user.email}. Method: ${body.method}. Transaction ID: ${body.transaction_id}.`,
    });
  }

  return NextResponse.json({ payment: data, message: "Payment submitted! We will activate your account within 2-4 hours." });
}

