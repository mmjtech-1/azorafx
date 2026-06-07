import { redirect } from "next/navigation";
import { DashboardProvider, type DashboardConnectedAccount, type DashboardSubscription, type DashboardUser } from "@/components/layout/DashboardProvider";
import { BottomNav } from "@/components/layout/BottomNav";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AutoSyncAccounts } from "@/components/layout/AutoSyncAccounts";
import { createClient } from "@/lib/supabase/server";

function getInitials(nameOrEmail: string) {
  const parts = nameOrEmail
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "A";
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: subscription }, { data: connectedAccounts }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, display_name, email")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("connected_accounts")
      .select("id,broker,nickname,account_balance,account_currency,sync_status,last_synced_at,is_primary")
      .eq("user_id", user.id)
      .neq("sync_status", "disconnected")
      .order("created_at", { ascending: false }),
  ]);

  const displayName =
    profile?.display_name ??
    profile?.full_name ??
    user.user_metadata.full_name ??
    user.email ??
    "Azora FX Trader";
  const email = profile?.email ?? user.email ?? "";

  const dashboardUser: DashboardUser = {
    id: user.id,
    email,
    name: displayName,
    initials: getInitials(displayName || email),
  };

  const dashboardSubscription: DashboardSubscription = {
    plan: subscription?.plan === "pro" ? "pro" : "free",
    status: subscription?.status ?? "active",
  };

  return (
    <DashboardProvider user={dashboardUser} subscription={dashboardSubscription} connectedAccounts={(connectedAccounts ?? []) as DashboardConnectedAccount[]}>
      <QueryProvider>
        <AutoSyncAccounts />
        <div className="flex min-h-screen bg-[#080B11] text-foreground-primary">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <div className="min-w-0 flex-1 pb-20 md:pb-0">
            <Topbar />
            <main className="p-3 sm:p-4 md:p-6">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
          <BottomNav />
        </div>
      </QueryProvider>
    </DashboardProvider>
  );
}
