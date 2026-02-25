import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type A11yMode = "deaf" | "no-arms" | "dyslexic" | "neuro" | "no-blue-light";

interface AccessibilityContextType {
  activeModes: Set<A11yMode>;
  toggleMode: (mode: A11yMode) => void;
  isActive: (mode: A11yMode) => boolean;
  clearAll: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

const MODE_CLASSES: Record<A11yMode, string> = {
  deaf: "a11y-deaf",
  "no-arms": "a11y-no-arms",
  dyslexic: "a11y-dyslexic",
  neuro: "a11y-neuro",
  "no-blue-light": "a11y-no-blue-light",
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [activeModes, setActiveModes] = useState<Set<A11yMode>>(() => {
    try {
      const saved = localStorage.getItem("openclaw-a11y-modes");
      return saved ? new Set(JSON.parse(saved) as A11yMode[]) : new Set<A11yMode>();
    } catch {
      return new Set<A11yMode>();
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    Object.values(MODE_CLASSES).forEach(cls => root.classList.remove(cls));
    Array.from(activeModes).forEach(mode => root.classList.add(MODE_CLASSES[mode]));
    localStorage.setItem("openclaw-a11y-modes", JSON.stringify(Array.from(activeModes)));
  }, [activeModes]);

  const toggleMode = (mode: A11yMode) => {
    setActiveModes(prev => {
      const next = new Set(prev);
      if (next.has(mode)) next.delete(mode);
      else next.add(mode);
      return next;
    });
  };

  const isActive = (mode: A11yMode) => activeModes.has(mode);
  const clearAll = () => setActiveModes(new Set());

  return (
    <AccessibilityContext.Provider value={{ activeModes, toggleMode, isActive, clearAll }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
