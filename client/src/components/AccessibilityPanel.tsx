import { useAccessibility, type A11yMode } from "@/contexts/AccessibilityContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Ear, Hand, BookOpen, Brain, Sun, RotateCcw } from "lucide-react";

const MODES: { id: A11yMode; label: string; description: string; icon: React.ElementType }[] = [
  { id: "deaf", label: "Deaf-Friendly", description: "Visual alerts for all audio cues, flash notifications", icon: Ear },
  { id: "no-arms", label: "No-Arms / Voice", description: "Enlarged touch targets (56px min), enhanced focus rings", icon: Hand },
  { id: "dyslexic", label: "Dyslexic-Friendly", description: "OpenDyslexic font, wider spacing, shorter line lengths", icon: BookOpen },
  { id: "neuro", label: "Neuro-Divergent", description: "No animations, simplified layout, calmer visuals", icon: Brain },
  { id: "no-blue-light", label: "No Blue Light", description: "Warm sepia filter to reduce eye strain", icon: Sun },
];

export default function AccessibilityPanel() {
  const { toggleMode, isActive, clearAll } = useAccessibility();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Accessibility Modes</h3>
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs gap-1">
          <RotateCcw className="w-3 h-3" /> Reset
        </Button>
      </div>
      <div className="space-y-3">
        {MODES.map(mode => (
          <div key={mode.id} className="flex items-start gap-3 p-3 rounded-lg glass-card">
            <mode.icon className="w-4 h-4 mt-0.5 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <Label htmlFor={`a11y-${mode.id}`} className="text-sm font-medium cursor-pointer">{mode.label}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{mode.description}</p>
            </div>
            <Switch id={`a11y-${mode.id}`} checked={isActive(mode.id)} onCheckedChange={() => toggleMode(mode.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
