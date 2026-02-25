import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONNECTOR_TYPES } from "@shared/constants";
import { Brain, Volume2, Github, GitBranch, HardDrive, Mail, MessageSquare, Headphones, Send, Phone, CreditCard, FileText, Plug, Plus, Loader2, Circle, Trash2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = { Brain, Volume2, Github, GitBranch, HardDrive, Mail, MessageSquare, Headphones, Send, Phone, CreditCard, FileText };

export default function ConnectorsPage() {
  const agents = trpc.agents.list.useQuery();
  const firstAgentId = agents.data?.[0]?.id;
  const connectors = trpc.connectors.list.useQuery({ agentId: firstAgentId ?? 0 }, { enabled: !!firstAgentId });
  const utils = trpc.useUtils();
  const createConnector = trpc.connectors.create.useMutation({ onSuccess: () => { if (firstAgentId) utils.connectors.list.invalidate(); setDialogOpen(false); toast.success("Connector added"); } });
  const deleteConnector = trpc.connectors.delete.useMutation({ onSuccess: () => { if (firstAgentId) utils.connectors.list.invalidate(); toast.success("Connector removed"); } });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<typeof CONNECTOR_TYPES[number] | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");

  const connectedIds = new Set(connectors.data?.map(c => c.type) ?? []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connector Marketplace</h1>
          <p className="text-muted-foreground mt-1">Add API connections to extend your agent's capabilities.</p>
        </div>

        {!firstAgentId ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Plug className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Register an agent first</h3>
            <p className="text-sm text-muted-foreground">You need at least one agent to add connectors.</p>
          </div>
        ) : (
          <>
            {/* Connected */}
            {connectors.data && connectors.data.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Active Connectors</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {connectors.data.map(c => {
                    const def = CONNECTOR_TYPES.find(t => t.id === c.type);
                    const Icon = def ? iconMap[def.icon] || Plug : Plug;
                    return (
                      <div key={c.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-chart-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{c.name}</p>
                          <div className="flex items-center gap-1.5">
                            <Circle className="w-2 h-2 fill-chart-3 text-chart-3" />
                            <span className="text-xs text-muted-foreground capitalize">{c.status}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => deleteConnector.mutate({ id: c.id })}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Available Connectors</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CONNECTOR_TYPES.map(ct => {
                  const Icon = iconMap[ct.icon] || Plug;
                  const isConnected = connectedIds.has(ct.id);
                  return (
                    <button key={ct.id} disabled={isConnected} onClick={() => { setSelected(ct); setApiKeyInput(""); setDialogOpen(true); }} className={`glass-card rounded-xl p-4 text-left transition-all ${isConnected ? "opacity-60" : "hover:border-primary/30"}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{ct.name}</p>
                            {isConnected && <Check className="w-3.5 h-3.5 text-chart-3" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{ct.category}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{ct.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect {selected?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">{selected?.description}</p>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="password" placeholder={`Enter your ${selected?.name} API key`} value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} />
              </div>
              <Button className="w-full" disabled={!apiKeyInput || createConnector.isPending} onClick={() => {
                if (!firstAgentId || !selected) return;
                createConnector.mutate({ agentId: firstAgentId, type: selected.id, name: selected.name, config: { apiKey: apiKeyInput } });
              }}>
                {createConnector.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Connect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
