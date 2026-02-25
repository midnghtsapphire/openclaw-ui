import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ListTodo, Plus, Loader2, Clock, CheckCircle, XCircle, Play, Pause } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function JobsPage() {
  const agents = trpc.agents.list.useQuery();
  const firstAgentId = agents.data?.[0]?.id;
  const jobs = trpc.jobs.list.useQuery({ agentId: firstAgentId ?? 0 }, { enabled: !!firstAgentId });
  const utils = trpc.useUtils();
  const createJob = trpc.jobs.create.useMutation({ onSuccess: () => { if (firstAgentId) utils.jobs.list.invalidate(); setOpen(false); toast.success("Job created"); } });
  const updateJob = trpc.jobs.update.useMutation({ onSuccess: () => { if (firstAgentId) utils.jobs.list.invalidate(); } });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });

  const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    queued: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
    running: { icon: Play, color: "text-primary", bg: "bg-primary/10" },
    completed: { icon: CheckCircle, color: "text-chart-3", bg: "bg-chart-3/10" },
    failed: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
    paused: { icon: Pause, color: "text-chart-4", bg: "bg-chart-4/10" },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Job Queue</h1>
            <p className="text-muted-foreground mt-1">Assign tasks to your agents and track progress.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="glow-primary" disabled={!firstAgentId}><Plus className="w-4 h-4 mr-2" /> New Job</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Job</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="e.g., Research AI frameworks" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Detailed task description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" disabled={!form.title || createJob.isPending} onClick={() => {
                  if (!firstAgentId) return;
                  createJob.mutate({ agentId: firstAgentId, title: form.title, description: form.description || undefined, priority: form.priority as "low" | "medium" | "high" | "critical" });
                }}>
                  {createJob.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Job
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!firstAgentId ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <ListTodo className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Register an agent first</h3>
            <p className="text-sm text-muted-foreground">You need at least one agent to create jobs.</p>
          </div>
        ) : jobs.isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : jobs.data && jobs.data.length > 0 ? (
          <div className="space-y-3">
            {jobs.data.map(job => {
              const cfg = statusConfig[job.status] || statusConfig.queued;
              const Icon = cfg.icon;
              return (
                <div key={job.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${cfg.color} ${job.status === "running" ? "animate-pulse" : ""}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{job.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} capitalize`}>{job.status}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${job.priority === "critical" ? "bg-destructive/10 text-destructive" : job.priority === "high" ? "bg-chart-4/10 text-chart-4" : "bg-muted text-muted-foreground"}`}>{job.priority}</span>
                      </div>
                      {job.description && <p className="text-sm text-muted-foreground mb-2">{job.description}</p>}
                      {job.progress > 0 && (
                        <div className="flex items-center gap-3">
                          <Progress value={job.progress} className="flex-1 h-1.5" />
                          <span className="text-xs text-muted-foreground">{job.progress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {job.status === "queued" && (
                        <Button size="sm" variant="outline" className="bg-transparent" onClick={() => { updateJob.mutate({ id: job.id, status: "running" }); toast.info("Job started"); }}>
                          <Play className="w-3 h-3 mr-1" /> Start
                        </Button>
                      )}
                      {job.status === "running" && (
                        <Button size="sm" variant="outline" className="bg-transparent" onClick={() => { updateJob.mutate({ id: job.id, status: "cancelled" }); toast.info("Job paused"); }}>
                          <Pause className="w-3 h-3 mr-1" /> Pause
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <ListTodo className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs in queue</h3>
            <p className="text-sm text-muted-foreground">Create a job to assign tasks to your agent.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
