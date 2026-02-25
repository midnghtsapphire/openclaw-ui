import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Upload, Loader2, AlertTriangle, CheckCircle, XCircle, FileCode, Scan } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SkillScannerPage() {
  const agents = trpc.agents.list.useQuery();
  const firstAgentId = agents.data?.[0]?.id;
  const skills = trpc.skills.list.useQuery({ agentId: firstAgentId ?? 0 }, { enabled: !!firstAgentId });
  const utils = trpc.useUtils();
  const uploadSkill = trpc.skills.upload.useMutation({ onSuccess: () => { if (firstAgentId) utils.skills.list.invalidate(); setUploadOpen(false); toast.success("Skill uploaded — ready for scanning"); } });
  const scanSkill = trpc.skills.scan.useMutation({ onSuccess: () => { if (firstAgentId) utils.skills.list.invalidate(); toast.success("Scan complete"); } });
  const installSkill = trpc.skills.install.useMutation({ onSuccess: () => { if (firstAgentId) utils.skills.list.invalidate(); toast.success("Skill installed"); } });

  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", fileName: "", fileUrl: "" });

  const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    pending: { icon: FileCode, color: "text-muted-foreground", bg: "bg-muted", label: "Pending Scan" },
    scanning: { icon: Loader2, color: "text-chart-4", bg: "bg-chart-4/10", label: "Scanning..." },
    safe: { icon: CheckCircle, color: "text-chart-3", bg: "bg-chart-3/10", label: "Safe" },
    warning: { icon: AlertTriangle, color: "text-chart-4", bg: "bg-chart-4/10", label: "Warning" },
    dangerous: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Dangerous" },
    error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Error" },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Malicious Skill Scanner</h1>
            <p className="text-muted-foreground mt-1">Upload skill files and scan for security threats before installation.</p>
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="glow-primary" disabled={!firstAgentId}><Upload className="w-4 h-4 mr-2" /> Upload Skill</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload Skill File</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Skill Name</Label>
                  <Input placeholder="e.g., Web Scraper" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="What does this skill do?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>File Name</Label>
                  <Input placeholder="skill_web_scraper.py" value={form.fileName} onChange={e => setForm(p => ({ ...p, fileName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>File URL (Google Drive or direct link)</Label>
                  <Input placeholder="https://drive.google.com/..." value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))} />
                </div>
                <Button className="w-full" disabled={!form.name || !form.fileName || !form.fileUrl || uploadSkill.isPending} onClick={() => {
                  if (!firstAgentId) return;
                  uploadSkill.mutate({ agentId: firstAgentId, ...form });
                }}>
                  {uploadSkill.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Banner */}
        <div className="glass-card rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1">How It Works</h3>
            <p className="text-sm text-muted-foreground">Upload a skill file and our AI security engine scans for prompt injection, data exfiltration, unauthorized API calls, hidden commands, and obfuscated code. Each skill receives a risk score from 0-100 with a detailed threat report.</p>
          </div>
        </div>

        {/* Skills List */}
        {!firstAgentId ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Register an agent first</h3>
            <p className="text-sm text-muted-foreground">You need at least one agent to scan skills.</p>
          </div>
        ) : skills.isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : skills.data && skills.data.length > 0 ? (
          <div className="space-y-3">
            {skills.data.map(skill => {
              const cfg = statusConfig[skill.scanStatus] || statusConfig.pending;
              const Icon = cfg.icon;
              const report = skill.scanReport as { riskScore?: number; summary?: string; threats?: { type: string; severity: string; description: string }[] } | null;
              return (
                <div key={skill.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${cfg.color} ${skill.scanStatus === "scanning" ? "animate-spin" : ""}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{skill.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                        {skill.riskScore !== null && skill.riskScore !== undefined && (
                          <span className="text-xs text-muted-foreground">Risk: {skill.riskScore}/100</span>
                        )}
                      </div>
                      {skill.description && <p className="text-sm text-muted-foreground mb-2">{skill.description}</p>}
                      <p className="text-xs text-muted-foreground">{skill.fileName}</p>
                      {report?.summary && <p className="text-sm mt-2 p-3 rounded-lg bg-muted/50">{report.summary}</p>}
                      {report?.threats && report.threats.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {report.threats.map((t, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <AlertTriangle className="w-3 h-3 text-chart-4 shrink-0 mt-0.5" />
                              <span><strong>{t.type}</strong> ({t.severity}): {t.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {skill.scanStatus === "pending" && (
                        <Button size="sm" onClick={() => scanSkill.mutate({ id: skill.id })} disabled={scanSkill.isPending}>
                          <Scan className="w-3 h-3 mr-1" /> Scan
                        </Button>
                      )}
                      {skill.scanStatus === "safe" && !skill.isInstalled && (
                        <Button size="sm" variant="outline" className="bg-transparent text-chart-3 border-chart-3/30" onClick={() => installSkill.mutate({ id: skill.id })}>
                          Install
                        </Button>
                      )}
                      {skill.isInstalled && <span className="text-xs text-chart-3 px-2 py-1">Installed</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <FileCode className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No skills uploaded</h3>
            <p className="text-sm text-muted-foreground">Upload a skill file to scan it for security threats.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
