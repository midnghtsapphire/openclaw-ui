import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RENTAL_CATEGORIES } from "@shared/constants";
import { ShoppingCart, Search, Star, Clock, Loader2, Phone, Megaphone, Package, Building, Scale, UtensilsCrossed, Headset, Database } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = { Phone, Megaphone, Package, Building, Scale, UtensilsCrossed, Headset, Search, Database };

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const listings = trpc.marketplace.browse.useQuery();
  const rentAgent = trpc.marketplace.rent.useMutation({ onSuccess: () => { toast.success("Rental started! Your agent is now active."); } });

  const filteredListings = (listings.data ?? []).filter(l => {
    if (categoryFilter !== "all" && l.rentalCategory !== categoryFilter) return false;
    if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Rental Marketplace</h1>
          <p className="text-muted-foreground mt-1">Rent pre-configured AI agents by the hour. Like a temp staffing agency for AI.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search agents..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {RENTAL_CATEGORIES.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {RENTAL_CATEGORIES.map(cat => {
            const Icon = iconMap[cat.icon] || ShoppingCart;
            return (
              <button key={cat.id} onClick={() => setCategoryFilter(cat.id)} className={`glass-card rounded-xl p-4 text-left transition-all hover:border-accent/30 ${categoryFilter === cat.id ? "border-accent/50" : ""}`}>
                <Icon className="w-5 h-5 text-accent mb-2" />
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.priceRange}</p>
              </button>
            );
          })}
        </div>

        {/* Listings */}
        {listings.isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : filteredListings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map(listing => (
              <div key={listing.id} className="glass-card rounded-xl p-5 space-y-4 hover:border-accent/20 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{listing.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{(listing.rentalCategory ?? "").replace(/-/g, " ")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-chart-4 fill-chart-4" />
                    <span className="text-sm font-medium">New</span>
                  </div>
                </div>
                {listing.description && <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-lg font-bold">${listing.rentalPricePerHour ? (listing.rentalPricePerHour / 100).toFixed(0) : "--"}</span>
                    <span className="text-xs text-muted-foreground">/hr</span>
                  </div>
                  <Button size="sm" onClick={() => { rentAgent.mutate({ agentId: listing.id }); }} disabled={rentAgent.isPending}>
                    Rent Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agents available</h3>
            <p className="text-sm text-muted-foreground">{searchQuery || categoryFilter !== "all" ? "Try adjusting your filters." : "Marketplace listings coming soon."}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
