import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import { DollarSign, Users, TrendingUp, CheckCircle } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="pl-2 pr-0 py-12 min-h-screen bg-background">
        {/* Header */}
        <div className="mb-14 text-left">
          <h1 className="text-5xl font-extrabold text-foreground mb-3 font-display tracking-tight">Dashboard</h1>
          <p className="text-lg text-muted-foreground font-content">Welcome back! Here's your financial overview.</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="flex justify-center mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left w-full max-w-6xl">
            <KPICard
              title="Assets Under Management"
              value="$0"
              icon={<DollarSign />}
              color="primary"
              trend={{ value: 8.5, direction: "up" }}
              sparkline={[30, 45, 35, 50, 42, 55, 48]}
            />
            <KPICard
              title="Active Trusts"
              value="0"
              icon={<Users />}
              color="secondary"
              trend={{ value: 3.2, direction: "up" }}
              sparkline={[100, 105, 110, 115, 120, 125, 127]}
            />
            <KPICard
              title="Client Accounts"
              value="0"
              icon={<Users />}
              color="success"
              trend={{ value: 2.1, direction: "up" }}
              sparkline={[70, 75, 78, 82, 85, 87, 89]}
            />
            <KPICard
              title="Compliance Status"
              value="0%"
              icon={<CheckCircle />}
              color="success"
            />
          </div>
        </div>
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 text-left">
          {/* Portfolio Performance */}
          <div className="bg-card border border-border rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all">
            <h2 className="text-2xl font-semibold text-foreground mb-8 font-display">Portfolio Performance</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-base">Year-to-Date</span>
                <span className="text-3xl font-bold text-success font-display">+12.3%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-success h-3 rounded-full" style={{ width: "65%" }} />
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Q4 Performance</span>
                <span className="text-primary font-semibold">+5.8%</span>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-card border border-border rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all">
            <h2 className="text-2xl font-semibold text-foreground mb-8 font-display">Pending Actions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-warning/10 rounded-xl border border-warning/20">
                <span className="text-base text-foreground">Document Review Required</span>
                <span className="text-sm font-semibold text-warning">3 items</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
                <span className="text-base text-foreground">Client Approvals Pending</span>
                <span className="text-sm font-semibold text-primary">5 items</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                <span className="text-base text-foreground">Compliance Checks</span>
                <span className="text-sm font-semibold text-secondary">2 items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-10 shadow-xl text-left">
          <h2 className="text-2xl font-semibold text-foreground mb-8 font-display">Recent Activity</h2>
          <div className="space-y-6">
            {[
              { action: "Trust Document Updated", time: "2 hours ago", status: "completed" },
              { action: "New Client Onboarded", time: "5 hours ago", status: "completed" },
              { action: "Portfolio Rebalance Initiated", time: "1 day ago", status: "in-progress" },
              { action: "Compliance Audit Scheduled", time: "2 days ago", status: "scheduled" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
                <div>
                  <p className="text-foreground font-medium text-lg font-content">{item.action}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
                <span
                  className={`text-sm font-semibold px-4 py-1 rounded-full font-display ${
                    item.status === "completed"
                      ? "bg-success/20 text-success"
                      : item.status === "in-progress"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
