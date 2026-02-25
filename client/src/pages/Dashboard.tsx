import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Bot, Plug, Activity, CreditCard, ArrowUpRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const agents = trpc.agents.list.useQuery();
  const billing = trpc.billing.getSubscription.useQuery();
  const activity = trpc.activity.list.useQuery({});
  const [, setLocation] = useLocation();

  const stats = [
    { label: "Active Agents", value: agents.data?.filter(a => a.status === "online").length ?? 0, total: agents.data?.length ?? 0, icon: Bot, color: "text-primary", bg: "bg-primary/10", path: "/agents" },
    { label: "Connectors", value: agents.data?.length ? "—" : "0", icon: Plug, color: "text-accent", bg: "bg-accent/10", path: "/connectors" },
    { label: "Subscription", value: billing.data?.tier?.toUpperCase() ?? "FREE", icon: CreditCard, color: "text-chart-3", bg: "bg-chart-3/10", path: "/billing" },
    { label: "Token Balance", value: billing.data?.tokenBalance?.toLocaleString() ?? "0", icon: Activity, color: "text-chart-4", bg: "bg-chart-4/10", path: "/billing" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your OpenClaw agent fleet.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <button key={i} onClick={() => setLocation(s.path)} className="glass-card rounded-xl p-5 text-left hover:border-primary/20 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold">{typeof s.value === "number" ? `${s.value}${s.total ? `/${s.total}` : ""}` : s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {activity.isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : activity.data && activity.data.length > 0 ? (
            <div className="space-y-3">
              {activity.data.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${log.severity === "critical" ? "bg-destructive" : log.severity === "error" ? "bg-destructive/70" : log.severity === "warning" ? "bg-chart-4" : "bg-chart-3"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.action.replace(/_/g, " ")}</p>
                    {log.details && <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.details}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet. Register your first agent to get started.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
