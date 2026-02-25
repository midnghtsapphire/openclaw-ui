import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, AlertTriangle, Circle, Eye, Loader2, OctagonX, Pause, Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function MonitoringPage() {
  const agents = trpc.agents.list.useQuery();
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const agentId = selectedAgentId ? Number(selectedAgentId) : (agents.data?.[0]?.id ?? null);
  const activity = trpc.activity.list.useQuery({ agentId: agentId ?? undefined }, { enabled: !!agentId, refetchInterval: 5000 });
  const updateAgent = trpc.agents.update.useMutation({ onSuccess: () => { trpc.useUtils().agents.list.invalidate(); } });
  const utils = trpc.useUtils();

  const selectedAgent = agents.data?.find(a => a.id === agentId);

  const severityConfig: Record<string, { color: string; bg: string }> = {
    info: { color: "text-chart-3", bg: "bg-chart-3/10" },
    warning: { color: "text-chart-4", bg: "bg-chart-4/10" },
    error: { color: "text-destructive", bg: "bg-destructive/10" },
    critical: { color: "text-destructive", bg: "bg-destructive/20" },
  };

  const handleKillSwitch = () => {
    if (!agentId) return;
    if (confirm("KILL SWITCH: This will immediately stop the agent. Continue?")) {
      updateAgent.mutate({ id: agentId, status: "paused" }, {
        onSuccess: () => { toast.error("Agent stopped via kill switch"); utils.agents.list.invalidate(); },
      });
    }
  };

  const handleResume = () => {
    if (!agentId) return;
    updateAgent.mutate({ id: agentId, status: "online" }, {
      onSuccess: () => { toast.success("Agent resumed"); utils.agents.list.invalidate(); },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Behavior Monitoring</h1>
            <p className="text-muted-foreground mt-1">Real-time activity feed, hallucination detection, and kill switch.</p>
          </div>
          <div className="flex items-center gap-3">
            {agents.data && agents.data.length > 0 && (
              <Select value={String(agentId ?? "")} onValueChange={setSelectedAgentId}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Select agent" /></SelectTrigger>
                <SelectContent>
                  {agents.data.map(a => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {!agentId ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Eye className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agent to monitor</h3>
            <p className="text-sm text-muted-foreground">Register an agent first.</p>
          </div>
        ) : (
          <>
            {/* Agent Status + Kill Switch */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-5">
                <p className="text-sm text-muted-foreground mb-2">Agent Status</p>
                <div className="flex items-center gap-2">
                  <Circle className={`w-3 h-3 fill-current ${selectedAgent?.status === "online" ? "text-chart-3" : selectedAgent?.status === "paused" ? "text-chart-4" : "text-muted-foreground"}`} />
                  <span className="text-lg font-bold capitalize">{selectedAgent?.status ?? "Unknown"}</span>
                </div>
              </div>
              <div className="glass-card rounded-xl p-5">
                <p className="text-sm text-muted-foreground mb-2">Activity Events (24h)</p>
                <p className="text-lg font-bold">{activity.data?.length ?? 0}</p>
              </div>
              <div className="glass-card rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Emergency Controls</p>
                  <p className="text-xs text-muted-foreground">Immediately stop or resume agent</p>
                </div>
                <div className="flex gap-2">
                  {selectedAgent?.status !== "paused" ? (
                    <Button variant="destructive" size="sm" onClick={handleKillSwitch} className="gap-1.5">
                      <OctagonX className="w-4 h-4" /> Kill Switch
                    </Button>
                  ) : (
                    <Button size="sm" className="gap-1.5 bg-chart-3 hover:bg-chart-3/90" onClick={handleResume}>
                      <Play className="w-4 h-4" /> Resume
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Activity Feed</h2>
                <Button variant="ghost" size="sm" onClick={() => utils.activity.list.invalidate()} className="gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
              </div>
              {activity.isLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : activity.data && activity.data.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {activity.data.map(log => {
                    const cfg = severityConfig[log.severity] || severityConfig.info;
                    return (
                      <div key={log.id} className={`flex items-start gap-3 p-3 rounded-lg ${cfg.bg} transition-all`}>
                        <div className="shrink-0 mt-0.5">
                          {log.severity === "critical" || log.severity === "error" ? (
                            <AlertTriangle className={`w-4 h-4 ${cfg.color}`} />
                          ) : (
                            <Activity className={`w-4 h-4 ${cfg.color}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{log.action.replace(/_/g, " ")}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{log.severity}</span>
                          </div>
                          {log.details && <p className="text-xs text-muted-foreground mt-1">{log.details}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
