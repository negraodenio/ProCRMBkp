import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          <ReportsDashboard />
        </main>
      </div>
    </div>
  );
}