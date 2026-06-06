import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("trade_reviews").select("*").eq("id", params.id).eq("user_id", user.id).single();
  if (error) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  return NextResponse.json({ review: data });
}
