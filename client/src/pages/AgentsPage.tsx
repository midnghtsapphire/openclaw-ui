import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Plus, Server, Cloud, Loader2, Circle, Pause, Trash2, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AgentsPage() {
  const agents = trpc.agents.list.useQuery();
  const utils = trpc.useUtils();
  const createAgent = trpc.agents.create.useMutation({ onSuccess: () => { utils.agents.list.invalidate(); setOpen(false); toast.success("Agent created successfully"); } });
  const updateAgent = trpc.agents.update.useMutation({ onSuccess: () => { utils.agents.list.invalidate(); } });
  const deleteAgent = trpc.agents.delete.useMutation({ onSuccess: () => { utils.agents.list.invalidate(); toast.success("Agent deleted"); } });

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", description: "", providerType: "existing" as string, serverIp: "", serverPort: 8080, apiKey: "", region: "nyc3" });

  const handleCreate = () => {
    createAgent.mutate({
      name: form.name,
      description: form.description || undefined,
      providerType: form.providerType as "existing" | "digitalocean",
      serverIp: form.providerType === "existing" ? form.serverIp : undefined,
      serverPort: form.providerType === "existing" ? form.serverPort : undefined,
      apiKey: form.apiKey || undefined,
      region: form.providerType !== "existing" ? form.region : undefined,
    });
  };

  const statusColors: Record<string, string> = {
    online: "text-chart-3",
    offline: "text-muted-foreground",
    provisioning: "text-chart-4",
    error: "text-destructive",
    paused: "text-chart-4",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Agents</h1>
            <p className="text-muted-foreground mt-1">Register existing agents or create new ones with one click.</p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setStep(1); }}>
            <DialogTrigger asChild>
              <Button className="glow-primary"><Plus className="w-4 h-4 mr-2" /> New Agent</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{step === 1 ? "Register Agent" : step === 2 ? "Connection Details" : "Confirm"}</DialogTitle>
              </DialogHeader>
              {step === 1 && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Agent Name</Label>
                    <Input placeholder="e.g., MindMappr" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Input placeholder="What does this agent do?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Provisioning Method</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setForm(p => ({ ...p, providerType: "existing" }))} className={`glass-card rounded-lg p-4 text-left transition-all ${form.providerType === "existing" ? "border-primary/50 glow-primary" : ""}`}>
                        <Server className="w-5 h-5 text-primary mb-2" />
                        <p className="text-sm font-medium">Connect Existing</p>
                        <p className="text-xs text-muted-foreground mt-1">Enter your server IP</p>
                      </button>
                      <button onClick={() => setForm(p => ({ ...p, providerType: "digitalocean" }))} className={`glass-card rounded-lg p-4 text-left transition-all ${form.providerType === "digitalocean" ? "border-primary/50 glow-primary" : ""}`}>
                        <Cloud className="w-5 h-5 text-accent mb-2" />
                        <p className="text-sm font-medium">One-Click Create</p>
                        <p className="text-xs text-muted-foreground mt-1">Auto-provision on DO</p>
                      </button>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => setStep(2)} disabled={!form.name}>Next</Button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4 pt-2">
                  {form.providerType === "existing" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Server IP Address</Label>
                        <Input placeholder="164.90.148.7" value={form.serverIp} onChange={e => setForm(p => ({ ...p, serverIp: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Port</Label>
                        <Input type="number" value={form.serverPort} onChange={e => setForm(p => ({ ...p, serverPort: parseInt(e.target.value) || 8080 }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>API Key (optional)</Label>
                        <Input type="password" placeholder="Your agent's API key" value={form.apiKey} onChange={e => setForm(p => ({ ...p, apiKey: e.target.value }))} />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label>Region</Label>
                      <Select value={form.region} onValueChange={v => setForm(p => ({ ...p, region: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nyc3">New York (NYC3)</SelectItem>
                          <SelectItem value="sfo3">San Francisco (SFO3)</SelectItem>
                          <SelectItem value="ams3">Amsterdam (AMS3)</SelectItem>
                          <SelectItem value="sgp1">Singapore (SGP1)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Your agent will be provisioned on a $12/mo DigitalOcean droplet.</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(1)}>Back</Button>
                    <Button className="flex-1" onClick={handleCreate} disabled={createAgent.isPending}>
                      {createAgent.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {form.providerType === "existing" ? "Connect Agent" : "Create Agent"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {agents.isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : agents.data && agents.data.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.data.map(agent => (
              <div key={agent.id} className="glass-card rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Circle className={`w-2 h-2 fill-current ${statusColors[agent.status] || "text-muted-foreground"}`} />
                        <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {agent.description && <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>}
                <div className="text-xs text-muted-foreground space-y-1">
                  {agent.serverIp && <p>IP: {agent.serverIp}:{agent.serverPort}</p>}
                  <p>Provider: {agent.providerType}</p>
                </div>
                <div className="flex gap-2 pt-2 border-t border-border">
                  {agent.status !== "paused" ? (
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent text-chart-4 border-chart-4/30 hover:bg-chart-4/10" onClick={() => { updateAgent.mutate({ id: agent.id, status: "paused" }); toast.info("Agent paused"); }}>
                      <Pause className="w-3 h-3 mr-1" /> Pause
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent text-chart-3 border-chart-3/30 hover:bg-chart-3/10" onClick={() => { updateAgent.mutate({ id: agent.id, status: "online" }); toast.success("Agent resumed"); }}>
                      Resume
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="bg-transparent text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { if (confirm("Delete this agent?")) deleteAgent.mutate({ id: agent.id }); }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agents registered</h3>
            <p className="text-sm text-muted-foreground mb-6">Connect an existing OpenClaw agent or create a new one with one click.</p>
            <Button onClick={() => setOpen(true)} className="glow-primary"><Plus className="w-4 h-4 mr-2" /> Register Your First Agent</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
