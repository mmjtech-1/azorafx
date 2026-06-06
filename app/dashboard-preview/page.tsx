import { DashboardProvider } from "@/components/layout/DashboardProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PreviewDashboard } from "@/app/dashboard-preview/PreviewDashboard";

export default function DashboardPreviewPage() {
  return (
    <DashboardProvider
      user={{
        id: "preview-user",
        email: "trader@azoraglobal.com",
        name: "Muhammad Mouazam",
        initials: "MM",
      }}
      subscription={{
        plan: "free",
        status: "active",
      }}
    >
      <div className="flex min-h-screen bg-[#080B11] text-foreground-primary">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="p-6">
            <PreviewDashboard />
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
