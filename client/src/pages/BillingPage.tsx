import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_TIERS } from "@shared/constants";
import { CreditCard, Check, Coins, Loader2, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const TOKEN_PACKS = [
  { tokens: 1000, price: 10 },
  { tokens: 5000, price: 40 },
  { tokens: 25000, price: 150 },
  { tokens: 100000, price: 500 },
];

export default function BillingPage() {
  const billing = trpc.billing.getSubscription.useQuery();
  const tokenHistory = trpc.billing.tokenHistory.useQuery();
  const currentTier = billing.data?.tier ?? "free";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Tokens</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription and token balance.</p>
        </div>

        {/* Current Plan */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Current Plan</h2>
            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium uppercase">{currentTier}</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Price</p>
              <p className="text-2xl font-bold">${SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS]?.price ?? 0}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Token Balance</p>
              <p className="text-2xl font-bold">{billing.data?.tokenBalance?.toLocaleString() ?? "0"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stripe Status</p>
              <p className="text-sm font-medium">{billing.data?.stripeCustomerId ? "Connected" : "Not connected"}</p>
            </div>
          </div>
        </div>

        {/* Upgrade Plans */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Subscription Plans</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
              const isActive = currentTier === key;
              return (
                <div key={key} className={`glass-card rounded-xl p-5 ${isActive ? "border-primary/40 glow-primary" : ""}`}>
                  <h3 className="font-semibold mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold">${tier.price}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" />{tier.agents} agents</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" />{tier.connectors} connectors</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" />{tier.tokens.toLocaleString()} tokens/mo</li>
                  </ul>
                  <Button className="w-full" variant={isActive ? "outline" : "default"} disabled={isActive} onClick={() => toast.info("Stripe checkout coming soon")}>
                    {isActive ? "Current Plan" : key === "free" ? "Downgrade" : "Upgrade"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Token Packs */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Buy Token Packs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOKEN_PACKS.map((pack, i) => (
              <button key={i} onClick={() => toast.info("Stripe checkout coming soon")} className="glass-card rounded-xl p-5 text-left hover:border-accent/30 transition-all">
                <Coins className="w-6 h-6 text-accent mb-3" />
                <p className="text-lg font-bold">{pack.tokens.toLocaleString()} tokens</p>
                <p className="text-sm text-muted-foreground">${pack.price}</p>
                <p className="text-xs text-muted-foreground mt-1">${(pack.price / pack.tokens * 1000).toFixed(1)} per 1K tokens</p>
              </button>
            ))}
          </div>
        </div>

        {/* Token History */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Token Usage History</h2>
          {tokenHistory.isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : tokenHistory.data && tokenHistory.data.length > 0 ? (
            <div className="space-y-2">
              {tokenHistory.data.map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                  <div>
                    <p className="font-medium capitalize">{entry.type.replace(/_/g, " ")}</p>
                    {entry.description && <p className="text-xs text-muted-foreground">{entry.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${entry.amount > 0 ? "text-chart-3" : "text-destructive"}`}>
                      {entry.amount > 0 ? "+" : ""}{entry.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No token transactions yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
