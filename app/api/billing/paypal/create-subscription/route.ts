import { NextResponse } from "next/server";
import { createSubscription } from "@/lib/paypal";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const subscription = await createSubscription(user.id, user.email ?? "");
    return NextResponse.json(subscription);
  } catch {
    return NextResponse.json({ error: "Unable to start PayPal checkout" }, { status: 500 });
  }
}

