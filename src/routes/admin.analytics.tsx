import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Users, Briefcase, UserCheck, Search, IndianRupee, Tag, Calendar } from "lucide-react";
import SearchAnalyticsWidget from "@/components/admin/SearchAnalyticsWidget";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Admin Analytics — IndusWork" }] }),
  component: AdminAnalytics,
});

type Booking = { id: string; service_name: string; status: string; created_at: string; price: number | null; city: string | null; user_id: string; provider_id: string | null };
type Profile = { id: string; role: string; created_at: string; trade: string | null; first_name: string | null };
type Search = { id: string; query: string; city: string | null; created_at: string };

function AdminAnalytics() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searches, setSearches] = useState<Search[]>([]);
  const [range, setRange] = useState<"7d" | "30d" | "all">("30d");

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      const admin = (data ?? []).some(r => r.role === "admin");
      setIsAdmin(admin);
      if (!admin) { toast.error("Admin access required"); navigate({ to: "/dashboard" }); }
    });
  }, [user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("bookings").select("id,service_name,status,created_at,price,city,user_id,provider_id").order("created_at", { ascending: false }).limit(1000),
      supabase.from("profiles").select("id,role,created_at,trade,first_name").limit(1000),
      supabase.from("search_queries").select("*").order("created_at", { ascending: false }).limit(500),
    ]).then(([b, p, s]) => {
      if (b.error) toast.error(b.error.message); else setBookings((b.data ?? []) as Booking[]);
      if (p.data) setProfiles(p.data as Profile[]);
      if (s.data) setSearches(s.data as Search[]);
    });
  }, [isAdmin]);

  const filtered = useMemo(() => {
    if (range === "all") return bookings;
    const days = range === "7d" ? 7 : 30;
    const cutoff = Date.now() - days * 86400000;
    return bookings.filter(b => new Date(b.created_at).getTime() >= cutoff);
  }, [bookings, range]);

  const stats = useMemo(() => {
    const revenue = filtered.filter(b => b.status === "Completed").reduce((s, b) => s + Number(b.price ?? 0), 0);
    const totalProviders = profiles.filter(p => p.role === "provider").length;
    const totalCustomers = profiles.filter(p => p.role === "customer").length;
    const newListings = filtered.length;
    const completed = filtered.filter(b => b.status === "Completed").length;
    const pending = filtered.filter(b => b.status === "Pending").length;
    const accepted = filtered.filter(b => b.status === "Accepted").length;
    const avgTicket = completed > 0 ? revenue / completed : 0;
    return { revenue, totalProviders, totalCustomers, newListings, completed, pending, accepted, avgTicket };
  }, [filtered, profiles]);

  const topServices = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    filtered.forEach(b => {
      const cur = map.get(b.service_name) ?? { count: 0, revenue: 0 };
      cur.count += 1;
      if (b.status === "Completed") cur.revenue += Number(b.price ?? 0);
      map.set(b.service_name, cur);
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [filtered]);

  const topSearches = useMemo(() => {
    const map = new Map<string, number>();
    searches.forEach(s => {
      const k = s.query.toLowerCase().trim();
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([q, n]) => ({ q, n })).sort((a, b) => b.n - a.n).slice(0, 10);
  }, [searches]);

  const cityBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(b => { if (b.city) map.set(b.city, (map.get(b.city) ?? 0) + 1); });
    return Array.from(map.entries()).map(([city, n]) => ({ city, n })).sort((a, b) => b.n - a.n).slice(0, 6);
  }, [filtered]);

  if (!user || isAdmin !== true) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="gradient-hero rounded-2xl p-7 text-white mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Admin · Analytics Dashboard</h1>
          <p className="text-sm opacity-80 mt-1">Revenue, services, providers, clients & search insights.</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "all"] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition ${range === r ? "bg-white text-navy border-white" : "bg-white/10 text-white border-white/30"}`}>
              {r === "7d" ? "Last 7 days" : r === "30d" ? "Last 30 days" : "All time"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        <Kpi icon={<IndianRupee className="w-5 h-5" />} label="Revenue (Completed)" value={`₹${stats.revenue.toLocaleString("en-IN")}`} hint={`${stats.completed} completed`} />
        <Kpi icon={<Briefcase className="w-5 h-5" />} label="Total Bookings" value={stats.newListings} hint={`${stats.pending} pending · ${stats.accepted} active`} />
        <Kpi icon={<UserCheck className="w-5 h-5" />} label="Service Providers" value={stats.totalProviders} hint="Across all trades" />
        <Kpi icon={<Users className="w-5 h-5" />} label="Total Clients" value={stats.totalCustomers} hint="Registered customers" />
        <Kpi icon={<TrendingUp className="w-5 h-5" />} label="Avg. Ticket Size" value={`₹${Math.round(stats.avgTicket).toLocaleString("en-IN")}`} hint="Per completed booking" />
        <Kpi icon={<Tag className="w-5 h-5" />} label="Active Services" value={topServices.length} hint="With bookings in range" />
        <Kpi icon={<Search className="w-5 h-5" />} label="Search Queries" value={searches.length} hint="Last 500 logged" />
        <Kpi icon={<Calendar className="w-5 h-5" />} label="Acceptance Rate" value={stats.newListings ? `${Math.round((stats.accepted + stats.completed) / stats.newListings * 100)}%` : "—"} hint="Accepted + completed" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <SearchAnalyticsWidget searches={searches} bookings={bookings} providers={profiles.filter(p => p.role === "provider")} />

        {/* Top services */}
        <Card title="Top Services (by bookings)">
          {topServices.length === 0 ? <Empty msg="No bookings in this range yet." /> : (
            <ul className="divide-y divide-border">
              {topServices.map((s, i) => {
                const max = topServices[0].count;
                return (
                  <li key={s.name} className="py-3">
                    <div className="flex items-center justify-between text-sm font-bold text-navy">
                      <span>#{i + 1} {s.name}</span>
                      <span className="text-gold">{s.count} · ₹{s.revenue.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-gold rounded-full" style={{ width: `${(s.count / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Top searches */}
        <Card title="Top Search Queries">
          {topSearches.length === 0 ? <Empty msg="No search queries logged yet. Searches from the homepage will appear here." /> : (
            <ul className="divide-y divide-border">
              {topSearches.map((s, i) => (
                <li key={s.q} className="py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">#{i + 1} <span className="text-navy font-bold">"{s.q}"</span></span>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-accent text-gold">{s.n}×</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* City breakdown */}
        <Card title="Bookings by City">
          {cityBreakdown.length === 0 ? <Empty msg="No city data yet." /> : (
            <ul className="space-y-3">
              {cityBreakdown.map(c => {
                const max = cityBreakdown[0].n;
                return (
                  <li key={c.city}>
                    <div className="flex items-center justify-between text-sm font-bold text-navy mb-1">
                      <span>📍 {c.city}</span><span>{c.n}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-navy rounded-full" style={{ width: `${(c.n / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Recent bookings */}
        <Card title="Recent Bookings">
          {filtered.length === 0 ? <Empty msg="No bookings yet." /> : (
            <ul className="divide-y divide-border">
              {filtered.slice(0, 8).map(b => (
                <li key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-navy text-sm truncate">{b.service_name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString("en-IN")} · {b.city ?? "—"}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-gold">₹{Number(b.price ?? 0).toLocaleString("en-IN")}</div>
                    <div className="text-[10px] font-extrabold uppercase text-muted-foreground">{b.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/admin" className="text-sm font-bold text-gold">← Contact messages</Link>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
      <div className="flex items-center gap-2 text-gold mb-2">{icon}<span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</span></div>
      <div className="font-display font-extrabold text-2xl text-navy">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
      <h2 className="font-display font-bold text-navy mb-4">{title}</h2>
      {children}
    </div>
  );
}
function Empty({ msg }: { msg: string }) { return <p className="text-sm text-muted-foreground py-4">{msg}</p>; }
