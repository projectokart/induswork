import { useMemo, useState } from "react";
import { categories } from "@/lib/services-data";

type Booking = { id: string; service_name: string; status: string; created_at: string; price: number | null; city: string | null; provider_id?: string | null };
type Profile = { id: string; first_name?: string | null; role?: string };
type Search = { id: string; query: string; city: string | null; created_at: string };

function matchService(q: string): string | null {
  const lower = q.toLowerCase();
  for (const cat of categories) for (const it of cat.items) {
    const tokens = it.name.toLowerCase().split(/\s+/);
    if (tokens.some(t => t.length >= 4 && lower.includes(t))) return it.name;
  }
  return null;
}

export default function SearchAnalyticsWidget({
  searches, bookings, providers,
}: { searches: Search[]; bookings: Booking[]; providers: Profile[] }) {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const cutoff = Date.now() - days * 86400000;

  const sIn = searches.filter(s => new Date(s.created_at).getTime() >= cutoff);
  const bIn = bookings.filter(b => new Date(b.created_at).getTime() >= cutoff);

  // Bucket per day
  const buckets = useMemo(() => {
    const map = new Map<string, { searches: number; bookings: number; completed: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      map.set(d, { searches: 0, bookings: 0, completed: 0 });
    }
    sIn.forEach(s => { const k = s.created_at.slice(0,10); const v = map.get(k); if (v) v.searches++; });
    bIn.forEach(b => { const k = b.created_at.slice(0,10); const v = map.get(k); if (v) { v.bookings++; if (b.status === "Completed") v.completed++; } });
    return Array.from(map.entries()).map(([d, v]) => ({ d, ...v }));
  }, [sIn, bIn, days]);

  const maxBar = Math.max(1, ...buckets.map(b => Math.max(b.searches, b.bookings)));

  // By service
  const byService = useMemo(() => {
    const map = new Map<string, { searches: number; bookings: number; completed: number }>();
    sIn.forEach(s => {
      const svc = matchService(s.query); if (!svc) return;
      const v = map.get(svc) ?? { searches: 0, bookings: 0, completed: 0 };
      v.searches++; map.set(svc, v);
    });
    bIn.forEach(b => {
      const v = map.get(b.service_name) ?? { searches: 0, bookings: 0, completed: 0 };
      v.bookings++; if (b.status === "Completed") v.completed++;
      map.set(b.service_name, v);
    });
    return Array.from(map.entries()).map(([name, v]) => ({
      name, ...v,
      conv: v.searches > 0 ? Math.round((v.bookings / v.searches) * 100) : null,
    })).sort((a, b) => (b.searches + b.bookings) - (a.searches + a.bookings)).slice(0, 10);
  }, [sIn, bIn]);

  // By provider
  const providerMap = new Map(providers.map(p => [p.id, p.first_name ?? "—"]));
  const byProvider = useMemo(() => {
    const map = new Map<string, { bookings: number; completed: number; revenue: number }>();
    bIn.forEach(b => {
      if (!b.provider_id) return;
      const v = map.get(b.provider_id) ?? { bookings: 0, completed: 0, revenue: 0 };
      v.bookings++;
      if (b.status === "Completed") { v.completed++; v.revenue += Number(b.price ?? 0); }
      map.set(b.provider_id, v);
    });
    return Array.from(map.entries()).map(([id, v]) => ({
      id, name: providerMap.get(id) ?? id.slice(0, 6), ...v,
      conv: v.bookings > 0 ? Math.round((v.completed / v.bookings) * 100) : 0,
    })).sort((a, b) => b.bookings - a.bookings).slice(0, 8);
  }, [bIn, providers]);

  const totalSearch = sIn.length;
  const totalBook = bIn.length;
  const overallConv = totalSearch > 0 ? Math.round((totalBook / totalSearch) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-soft lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-bold text-navy">🔎 Search → Booking Conversion</h2>
          <p className="text-xs text-muted-foreground mt-1">Track which searches and providers actually convert.</p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as const).map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`text-[11px] font-extrabold px-3 py-1.5 rounded-full border ${days === d ? "bg-navy text-white border-navy" : "bg-muted text-muted-foreground border-border"}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Mini label="Searches" value={totalSearch} color="text-navy" />
        <Mini label="Bookings" value={totalBook} color="text-gold" />
        <Mini label="Conversion" value={`${overallConv}%`} color="text-amber-600" />
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">Daily trend</div>
        <div className="flex items-end gap-[3px] h-28">
          {buckets.map(b => (
            <div key={b.d} className="flex-1 flex flex-col justify-end gap-[2px]" title={`${b.d}: ${b.searches} searches · ${b.bookings} bookings`}>
              <div className="bg-navy/70 rounded-sm" style={{ height: `${(b.searches / maxBar) * 100}%`, minHeight: b.searches ? 2 : 0 }} />
              <div className="bg-gold rounded-sm" style={{ height: `${(b.bookings / maxBar) * 100}%`, minHeight: b.bookings ? 2 : 0 }} />
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-[10px] font-bold text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-navy/70 rounded-sm" />Searches</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gold rounded-sm" />Bookings</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* By Service */}
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">By Service</div>
          {byService.length === 0 ? <Empty /> : (
            <table className="w-full text-sm">
              <thead><tr className="text-[10px] uppercase text-muted-foreground"><th className="text-left py-1">Service</th><th className="text-right">Search</th><th className="text-right">Book</th><th className="text-right">Conv</th></tr></thead>
              <tbody>
                {byService.map(s => (
                  <tr key={s.name} className="border-t border-border">
                    <td className="py-1.5 font-semibold text-navy truncate max-w-[140px]">{s.name}</td>
                    <td className="text-right">{s.searches}</td>
                    <td className="text-right text-gold font-bold">{s.bookings}</td>
                    <td className="text-right">{s.conv === null ? "—" : <span className={s.conv >= 30 ? "text-emerald-600 font-bold" : "text-muted-foreground"}>{s.conv}%</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* By Provider */}
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">By Provider</div>
          {byProvider.length === 0 ? <Empty msg="No assigned bookings yet." /> : (
            <table className="w-full text-sm">
              <thead><tr className="text-[10px] uppercase text-muted-foreground"><th className="text-left py-1">Provider</th><th className="text-right">Jobs</th><th className="text-right">Done</th><th className="text-right">Rate</th></tr></thead>
              <tbody>
                {byProvider.map(p => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-1.5 font-semibold text-navy">{p.name}</td>
                    <td className="text-right">{p.bookings}</td>
                    <td className="text-right text-gold font-bold">{p.completed}</td>
                    <td className="text-right"><span className={p.conv >= 60 ? "text-emerald-600 font-bold" : "text-muted-foreground"}>{p.conv}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="text-[10px] font-extrabold uppercase text-muted-foreground">{label}</div>
      <div className={`font-display font-extrabold text-xl ${color}`}>{value}</div>
    </div>
  );
}
function Empty({ msg = "No data yet." }: { msg?: string }) { return <p className="text-xs text-muted-foreground py-4">{msg}</p>; }
