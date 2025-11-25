import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import { DollarSign, Users, TrendingUp, CheckCircle } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <KPICard
            title="Assets Under Management"
            value="$45.2M"
            icon={<DollarSign />}
            color="primary"
            trend={{ value: 8.5, direction: "up" }}
            sparkline={[30, 45, 35, 50, 42, 55, 48]}
          />
          <KPICard
            title="Active Trusts"
            value="127"
            icon={<Users />}
            color="secondary"
            trend={{ value: 3.2, direction: "up" }}
            sparkline={[100, 105, 110, 115, 120, 125, 127]}
          />
          <KPICard
            title="Client Accounts"
            value="89"
            icon={<Users />}
            color="success"
            trend={{ value: 2.1, direction: "up" }}
            sparkline={[70, 75, 78, 82, 85, 87, 89]}
          />
          <KPICard
            title="Compliance Status"
            value="100%"
            icon={<CheckCircle />}
            color="success"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Portfolio Performance */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-card hover:shadow-card-hover transition-all">
            <h2 className="text-xl font-semibold text-foreground mb-6">Portfolio Performance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Year-to-Date</span>
                <span className="text-2xl font-bold text-success">+12.3%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: "65%" }} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Q4 Performance</span>
                <span className="text-primary font-semibold">+5.8%</span>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-card hover:shadow-card-hover transition-all">
            <h2 className="text-xl font-semibold text-foreground mb-6">Pending Actions</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                <span className="text-sm text-foreground">Document Review Required</span>
                <span className="text-xs font-semibold text-warning">3 items</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                <span className="text-sm text-foreground">Client Approvals Pending</span>
                <span className="text-xs font-semibold text-primary">5 items</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                <span className="text-sm text-foreground">Compliance Checks</span>
                <span className="text-xs font-semibold text-secondary">2 items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: "Trust Document Updated", time: "2 hours ago", status: "completed" },
              { action: "New Client Onboarded", time: "5 hours ago", status: "completed" },
              { action: "Portfolio Rebalance Initiated", time: "1 day ago", status: "in-progress" },
              { action: "Compliance Audit Scheduled", time: "2 days ago", status: "scheduled" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                <div>
                  <p className="text-foreground font-medium">{item.action}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
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
