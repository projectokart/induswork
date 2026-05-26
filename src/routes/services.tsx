import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { categories } from "@/lib/services-data";
import { slugify } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Phone, MessageSquare, ShieldCheck, Star, MapPin, Filter } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Services — IndusWork" }, { name: "description", content: "Verified service providers across India. Compare price, ratings & book instantly." }] }),
  component: Services,
});

const CITIES = ["All", "Delhi", "Mumbai", "Pune", "Bangalore", "Hyderabad", "Gurgaon", "Noida"];

function Services() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("All");
  const [activeCat, setActiveCat] = useState<string>("all");

  const items = useMemo(() => {
    const all = categories.flatMap(c => c.items.map(it => ({ ...it, category: c.title, categoryKey: c.key, emoji: c.emoji, tint: c.tint })));
    return all.filter(i => {
      if (activeCat !== "all" && i.categoryKey !== activeCat) return false;
      if (q && !(`${i.name} ${i.desc} ${i.category}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [q, activeCat]);

  const book = async (name: string) => {
    if (!user) { toast.info("Please login to book"); navigate({ to: "/login" }); return; }
    const { data, error } = await supabase.from("bookings")
      .insert({ user_id: user.id, service_name: name, status: "Pending", city: profile?.city ?? null })
      .select("id").single();
    if (error || !data) { toast.error(error?.message ?? "Could not create booking"); return; }
    toast.success(`${name} booked!`);
    navigate({ to: "/booking/$id", params: { id: data.id } });
  };

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* IndiaMART-style top search bar */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-gold to-gold-deep shadow-soft">
        <div className="max-w-6xl mx-auto px-4 pt-3 pb-2">
          <div className="bg-white rounded-xl flex items-center gap-2 px-3 h-11 shadow-soft">
            <Search className="w-4 h-4 text-gold shrink-0" />
            <Input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search services, providers…"
              className="border-0 focus-visible:ring-0 h-9 px-0 text-sm flex-1"
            />
            <button className="text-[10px] font-extrabold text-gold bg-accent px-2 py-1 rounded">{items.length} found</button>
          </div>

          {/* City chips row */}
          <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 -mx-1 px-1">
            <span className="flex items-center text-white shrink-0"><MapPin className="w-3.5 h-3.5" /></span>
            {CITIES.map(c => (
              <button key={c} onClick={() => setCity(c)}
                className={`text-[11px] font-extrabold px-3 h-7 rounded-full whitespace-nowrap transition ${city === c ? "bg-white text-gold" : "bg-white/15 text-white border border-white/30"}`}>
                {c === "All" ? "All Cities" : c}
              </button>
            ))}
          </div>

          {/* Category chips row */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto pb-2 -mx-1 px-1">
            <span className="flex items-center text-white shrink-0"><Filter className="w-3.5 h-3.5" /></span>
            <button onClick={() => setActiveCat("all")}
              className={`text-[11px] font-extrabold px-3 h-7 rounded-full whitespace-nowrap ${activeCat === "all" ? "bg-white text-gold" : "bg-white/15 text-white border border-white/30"}`}>
              All
            </button>
            {categories.map(c => (
              <button key={c.key} onClick={() => setActiveCat(c.key)}
                className={`text-[11px] font-extrabold px-3 h-7 rounded-full whitespace-nowrap ${activeCat === c.key ? "bg-white text-gold" : "bg-white/15 text-white border border-white/30"}`}>
                {c.emoji} {c.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 py-4 space-y-3">
        {/* Post-requirement promo strip */}
        <Link to="/post-requirement" className="block bg-gradient-to-r from-navy to-navy-deep text-white rounded-xl p-4 shadow-soft active:scale-[0.99] transition">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📢</span>
            <div className="flex-1">
              <div className="font-display font-extrabold text-sm">Can't find what you need?</div>
              <div className="text-xs opacity-80">Post your requirement — providers will contact you.</div>
            </div>
            <span className="bg-gold text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full">Post →</span>
          </div>
        </Link>

        {items.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
            No services match your filters.
          </div>
        )}

        {items.map((s, idx) => (
          <article key={s.name} className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-elevate transition">
            <div className="p-4">
              {/* Title row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <Link to="/services/$slug" params={{ slug: slugify(s.name) }} className="font-display font-extrabold text-navy text-base leading-tight hover:text-gold min-w-0">
                  {s.name}
                </Link>
                <div className="text-right shrink-0">
                  <div className="font-display font-extrabold text-navy text-lg leading-none whitespace-nowrap">{s.price}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">starting</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link to="/services/$slug" params={{ slug: slugify(s.name) }} className="shrink-0">
                  <img src={s.img} alt={s.name} loading="lazy" className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-lg border border-border" />
                </Link>
                <div className="min-w-0 flex-1 text-xs sm:text-sm text-foreground/80 space-y-1">
                  <Row k="Category" v={`${s.emoji} ${s.category}`} />
                  <Row k="Visit" v="On-site within 60 min" />
                  <Row k="Warranty" v="7-day re-visit free" />
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-1">{s.desc}</p>

                  <div className="flex items-center gap-2 pt-1.5">
                    <span className="flex items-center gap-0.5 text-amber-500"><ShieldCheck className="w-3.5 h-3.5 text-gold" /><span className="text-[10px] font-extrabold text-gold">Verified</span></span>
                    <span className="flex items-center gap-0.5 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-[11px] font-extrabold text-navy">4.{6 + (idx % 4)}</span>
                      <span className="text-[10px] text-muted-foreground">({(120 + idx * 37) % 900 + 80})</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">· {(2 + (idx % 8))}+ yrs exp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="grid grid-cols-2 border-t border-border">
              <Link to="/services/$slug" params={{ slug: slugify(s.name) }} className="flex items-center justify-center gap-2 py-3 text-gold font-extrabold text-sm border-r border-border active:bg-accent">
                <Phone className="w-4 h-4" /> View Details
                <span className="text-[10px] text-muted-foreground hidden sm:inline">· 95% Resp.</span>
              </Link>
              <button onClick={() => book(s.name)} className="flex items-center justify-center gap-2 py-3 bg-gold text-white font-extrabold text-sm active:bg-gold-deep">
                <MessageSquare className="w-4 h-4" /> Get Best Price
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div><span className="font-bold text-navy">{k}:</span> <span className="text-foreground/80">{v}</span></div>;
}
