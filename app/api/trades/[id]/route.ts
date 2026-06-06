import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateRiskReward, tradeUpdateSchema } from "@/types/trades";

type RouteContext = {
  params: {
    id: string;
  };
};

function storagePathFromUrl(url: string) {
  const marker = "/trade-screenshots/";
  const index = url.indexOf(marker);
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : url;
}

async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { supabase, user } = await getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json({ trade: data });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { supabase, user } = await getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = tradeUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("trades")
    .select("direction,entry_price,stop_loss,take_profit")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  const merged = { ...existing, ...parsed.data };
  const payload = {
    ...parsed.data,
    risk_reward: calculateRiskReward(merged) ?? parsed.data.risk_reward,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("trades")
    .update(payload)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ trade: data });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { supabase, user } = await getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing, error: readError } = await supabase
    .from("trades")
    .select("screenshot_urls")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (readError) return NextResponse.json({ error: readError.message }, { status: 404 });

  const screenshots = (existing?.screenshot_urls ?? []) as string[];
  if (screenshots.length) {
    await supabase.storage
      .from("trade-screenshots")
      .remove(screenshots.map(storagePathFromUrl));
  }

  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
