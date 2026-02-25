import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  Bot, Shield, Zap, Brain, Eye, ShoppingCart, MessageSquare,
  ChevronRight, Check, Star, ArrowRight, Sparkles, Lock,
  Activity, BarChart3, Globe, Users
} from "lucide-react";

const features = [
  { icon: Bot, title: "One-Click Agent Provisioning", desc: "Deploy a fully configured OpenClaw agent on DigitalOcean in under 60 seconds. No SSH, no config files." },
  { icon: Shield, title: "Malicious Skill Scanner", desc: "AI-powered security analysis scans every skill file for prompt injection, data exfiltration, and hidden commands before installation." },
  { icon: Eye, title: "Behavior Monitoring", desc: "Real-time dashboard tracks hallucinations, erratic behavior, and conversation quality. Kill switch stops your agent instantly." },
  { icon: Brain, title: "Multi-Model Research", desc: "Send queries to multiple LLMs simultaneously via OpenRouter. Cross-validate and aggregate results automatically." },
  { icon: Zap, title: "Connector Marketplace", desc: "12+ pre-built integrations: OpenRouter, GitHub, Slack, Discord, Telegram, Gmail, Google Drive, and more." },
  { icon: ShoppingCart, title: "Agent Rental Marketplace", desc: "Rent pre-configured AI agents by the hour. Dental, legal, restaurant, real estate — every vertical covered." },
];

const pricingTiers = [
  { name: "Standard", price: 200, tokens: "10,000", agents: 5, connectors: 15, popular: false, features: ["5 agents", "15 connectors", "10K tokens/mo", "Skill scanner", "Basic monitoring", "Email support"] },
  { name: "Enterprise", price: 400, tokens: "50,000", agents: 25, connectors: 50, popular: true, features: ["25 agents", "50 connectors", "50K tokens/mo", "Advanced scanner", "Full monitoring + alerts", "Priority support", "Multi-model research", "Job queue management"] },
  { name: "Premium", price: 1500, tokens: "250,000", agents: 100, connectors: 200, popular: false, features: ["100 agents", "200 connectors", "250K tokens/mo", "Enterprise scanner", "Crossover memory", "Dedicated support", "Rental marketplace access", "Custom integrations", "SLA guarantee"] },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-strong">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-primary">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold gradient-text">OpenClaw</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Marketplace</a>
            <a href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => setLocation("/dashboard")} className="glow-primary">
                Dashboard <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => { window.location.href = getLoginUrl(); }} className="text-sm">
                  Sign In
                </Button>
                <Button onClick={() => { window.location.href = getLoginUrl(); }} className="glow-primary">
                  Get Started <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[128px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chart-3/10 rounded-full blur-[200px]" />
        </div>
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">The professional management platform for autonomous AI agents</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              <span className="gradient-text">Command Your</span>
              <br />
              <span className="text-foreground">AI Agent Fleet</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Register, provision, monitor, and scale OpenClaw agents with enterprise-grade security. 
              One-click deployment. Built-in skill scanner. Real-time behavior monitoring.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => { window.location.href = getLoginUrl(); }} className="text-base px-8 py-6 glow-primary">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => { const el = document.getElementById("features"); el?.scrollIntoView({ behavior: "smooth" }); }} className="text-base px-8 py-6 bg-transparent">
                See Features <ChevronRight className="ml-1 w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> SOC 2 Ready</div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> 99.9% Uptime</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> FOSS-First</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to <span className="gradient-text">Manage AI Agents</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From one-click provisioning to real-time behavior monitoring, OpenClaw gives you complete control over your autonomous AI fleet.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Scanner Highlight */}
      <section className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-destructive/10 rounded-full blur-[128px]" />
        </div>
        <div className="container relative">
          <div className="glass-card rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm mb-6">
                  <Shield className="w-4 h-4" /> Industry First
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Malicious Skill Scanner</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Like antivirus for AI agents. Every skill file is scanned for prompt injection, data exfiltration, 
                  unauthorized API calls, hidden commands, and obfuscated code before it touches your agent.
                </p>
                <ul className="space-y-3">
                  {["Prompt injection detection", "Data exfiltration analysis", "Hidden command identification", "Obfuscated code decompilation", "Risk score 0-100 with detailed report"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-chart-3 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scan Results</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-chart-3/20 text-chart-3">Safe</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Prompt Injection</span><span className="text-chart-3">Clear</span></div>
                  <div className="w-full h-1.5 rounded-full bg-muted"><div className="h-full w-[5%] rounded-full bg-chart-3" /></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Data Exfiltration</span><span className="text-chart-3">Clear</span></div>
                  <div className="w-full h-1.5 rounded-full bg-muted"><div className="h-full w-[2%] rounded-full bg-chart-3" /></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Hidden Commands</span><span className="text-chart-4">Low Risk</span></div>
                  <div className="w-full h-1.5 rounded-full bg-muted"><div className="h-full w-[15%] rounded-full bg-chart-4" /></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Obfuscated Code</span><span className="text-chart-3">Clear</span></div>
                  <div className="w-full h-1.5 rounded-full bg-muted"><div className="h-full w-[0%] rounded-full bg-chart-3" /></div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Risk Score</span>
                    <span className="text-2xl font-bold text-chart-3">8/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent <span className="gradient-text">Pricing</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Start free. Scale as you grow. All plans include the malicious skill scanner and behavior monitoring.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <div key={i} className={`glass-card rounded-xl p-8 relative ${tier.popular ? "border-primary/40 glow-primary" : ""}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">${tier.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${tier.popular ? "glow-primary" : ""}`} variant={tier.popular ? "default" : "outline"} onClick={() => { window.location.href = getLoginUrl(); }}>
                  Get Started
                </Button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">Need more tokens? Purchase additional packs starting at $10 for 1,000 tokens.</p>
          </div>
        </div>
      </section>

      {/* Marketplace Preview */}
      <section id="marketplace" className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/15 rounded-full blur-[128px]" />
        </div>
        <div className="container relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Agent Rental <span className="gradient-text">Marketplace</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Rent pre-configured AI agents by the hour. Like a temp staffing agency, but for AI. No monthly commitment.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Phone Answering", price: "$8/hr", rating: 4.9, desc: "Answers calls, takes messages, schedules appointments" },
              { name: "Marketing Agent", price: "$15/hr", rating: 4.8, desc: "Social media posts, copy, campaign scheduling" },
              { name: "Dental Office", price: "$20/hr", rating: 4.9, desc: "Insurance verification, appointment scheduling" },
              { name: "Legal Intake", price: "$25/hr", rating: 4.7, desc: "Client intake, document review, scheduling" },
            ].map((agent, i) => (
              <div key={i} className="glass-card rounded-xl p-5 hover:border-accent/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">{agent.price}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-chart-4 fill-chart-4" />
                    <span className="text-xs">{agent.rating}</span>
                  </div>
                </div>
                <h4 className="font-semibold mb-1">{agent.name}</h4>
                <p className="text-xs text-muted-foreground">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="glass-card rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[128px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your AI Agents?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">Join the platform that gives you enterprise-grade management for autonomous AI. Start free, scale to premium.</p>
              <Button size="lg" onClick={() => { window.location.href = getLoginUrl(); }} className="text-base px-8 py-6 glow-primary">
                Start Building Today <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold gradient-text">OpenClaw</span>
              </div>
              <p className="text-sm text-muted-foreground">Professional AI agent management by GlowStarLabs.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="/docs" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</a></li>
                <li><a href="/docs" className="hover:text-foreground transition-colors">API Docs</a></li>
                <li><a href="/docs" className="hover:text-foreground transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://glowstarlabs.com" className="hover:text-foreground transition-colors">GlowStarLabs</a></li>
                <li><a href="https://meetaudreyevans.com" className="hover:text-foreground transition-colors">Audrey Evans Official</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GlowStarLabs / Audrey Evans Official. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
