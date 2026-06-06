import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user?.id).maybeSingle();
  if (!profile?.is_admin) redirect("/dashboard");
  const [{ data: pending }, { data: users }, { data: payments }] = await Promise.all([
    supabase.from("manual_payments").select("*, profiles(email)").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,email,created_at, subscriptions(plan), trades(id)"),
    supabase.from("payments").select("amount_usd,created_at,status").gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);
  const revenue = (payments ?? []).reduce((sum, payment) => sum + Number(payment.amount_usd ?? 0), 0);
  const proUsers = (users ?? []).filter((row) => row.subscriptions?.[0]?.plan === "pro").length;
  return (
    <div className="space-y-6">
      <header className="border-b border-white/[0.06] pb-5">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#00D68F]/20 bg-[#00D68F]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#00D68F]"><ShieldCheck className="h-3.5 w-3.5" /> Admin</div>
        <h1 className="text-3xl font-semibold text-white">Billing Admin</h1>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[16px] border border-border bg-background-secondary p-5"><p className="text-sm text-foreground-secondary">Total Users</p><p className="mt-2 text-3xl font-semibold text-white">{users?.length ?? 0}</p></div>
        <div className="rounded-[16px] border border-border bg-background-secondary p-5"><p className="text-sm text-foreground-secondary">Pro Users</p><p className="mt-2 text-3xl font-semibold text-[#00D68F]">{proUsers}</p></div>
        <div className="rounded-[16px] border border-border bg-background-secondary p-5"><p className="text-sm text-foreground-secondary">Revenue This Month</p><p className="mt-2 text-3xl font-semibold text-white">${revenue.toFixed(0)}</p></div>
      </section>
      <section className="rounded-[16px] border border-border bg-background-secondary p-5">
        <h2 className="mb-4 text-xl font-semibold text-white">Pending Payments</h2>
        <div className="space-y-2">{(pending ?? []).map((payment) => <div key={payment.id} className="grid grid-cols-7 gap-3 rounded-xl bg-background-tertiary p-3 text-sm text-foreground-secondary"><span>{payment.profiles?.email}</span><span>{payment.method}</span><span>${payment.amount_usd}</span><span>{payment.transaction_id}</span><a className="text-[#00D68F]" href={payment.screenshot_url ?? "#"}>Screenshot</a><form action="/api/billing/activate" method="post"><input type="hidden" name="user_id" value={payment.user_id} /><input type="hidden" name="payment_id" value={payment.id} /><button className="text-[#00D68F]">Activate</button></form><button className="text-[#FF8895]">Reject</button></div>)}</div>
      </section>
      <section className="rounded-[16px] border border-border bg-background-secondary p-5">
        <h2 className="mb-4 text-xl font-semibold text-white">All Users</h2>
        <div className="space-y-2">{(users ?? []).map((row) => <div key={row.id} className="grid grid-cols-4 gap-3 rounded-xl bg-background-tertiary p-3 text-sm text-foreground-secondary"><span>{row.email}</span><span>{row.subscriptions?.[0]?.plan ?? "free"}</span><span>{new Date(row.created_at).toLocaleDateString()}</span><span>{row.trades?.length ?? 0} trades</span></div>)}</div>
      </section>
    </div>
  );
}
