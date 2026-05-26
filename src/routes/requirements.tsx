import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapPin, Phone, Wallet, Clock, CheckCircle2, Megaphone, Briefcase } from "lucide-react";

export const Route = createFileRoute("/requirements")({
  head: () => ({ meta: [{ title: "Live Requirements — IndusWork" }, { name: "description", content: "Customer requirements posted live. Providers can accept jobs." }] }),
  component: Requirements,
});

type Req = {
  id: string; user_id: string; name: string; phone: string; address: string; city: string | null;
  work_type: string; description: string; budget: number | null; status: string;
  accepted_by: string | null; created_at: string;
};

function Requirements() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<Req[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [tab, setTab] = useState<"open" | "mine">("open");

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("requirements").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) toast.error(error.message);
    else setList((data ?? []) as Req[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  // realtime
  useEffect(() => {
    const ch = supabase.channel("requirements-live").on("postgres_changes",
      { event: "*", schema: "public", table: "requirements" }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const isProvider = profile?.role === "provider";

  const accept = async (r: Req) => {
    if (!user) return;
    if (!isProvider) { toast.error("Only providers can accept requirements"); return; }
    setBusy(r.id);
    const { error } = await supabase.from("requirements")
      .update({ status: "accepted", accepted_by: user.id, accepted_at: new Date().toISOString() })
      .eq("id", r.id).is("accepted_by", null).eq("status", "open");
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Requirement accepted — contact the customer now");
    await supabase.from("notifications").insert({
      user_id: r.user_id,
      title: "Your requirement was accepted ✅",
      body: `A verified provider accepted your "${r.work_type}" request and will contact you on ${r.phone}.`,
      type: "requirement_accepted",
      link: "/dashboard",
    });
    load();
  };

  const close = async (r: Req) => {
    setBusy(r.id);
    const { error } = await supabase.from("requirements").update({ status: "closed" }).eq("id", r.id);
    setBusy(null);
    if (error) toast.error(error.message); else { toast.success("Closed"); load(); }
  };

  const filtered = useMemo(() => {
    let xs = list;
    if (tab === "mine") xs = xs.filter(r => r.user_id === user?.id || r.accepted_by === user?.id);
    else xs = xs.filter(r => r.status === "open");
    if (city.trim()) xs = xs.filter(r => (r.city ?? "").toLowerCase().includes(city.toLowerCase()));
    if (type.trim()) xs = xs.filter(r => r.work_type.toLowerCase().includes(type.toLowerCase()));
    return xs;
  }, [list, tab, city, type, user]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* IndiaMART-style sticky filter bar */}
      <div className="sticky top-16 z-30 -mx-4 px-4 bg-gradient-to-r from-gold to-gold-deep pt-3 pb-3 mb-4 shadow-soft">
        <div className="flex items-center gap-2 text-white">
          <Megaphone className="w-5 h-5 shrink-0" />
          <h1 className="font-display font-extrabold text-base md:text-xl">Live Customer Requirements</h1>
          <span className="ml-auto bg-white/20 text-[11px] font-extrabold px-2.5 py-1 rounded-full">{filtered.length} {tab === "open" ? "open" : "mine"}</span>
        </div>
        <div className="flex gap-1.5 mt-3 overflow-x-auto -mx-1 px-1 pb-1">
          <Chip active={tab==="open"} onClick={() => setTab("open")}>🔥 Open</Chip>
          <Chip active={tab==="mine"} onClick={() => setTab("mine")}>👤 Mine</Chip>
          <Input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="City" className="h-8 w-28 bg-white text-xs" />
          <Input value={type} onChange={(e)=>setType(e.target.value)} placeholder="Work type" className="h-8 w-32 bg-white text-xs" />
          <Button asChild size="sm" className="ml-auto bg-white text-gold hover:bg-white/90 font-extrabold whitespace-nowrap"><Link to="/post-requirement">+ Post</Link></Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No requirements found. {tab === "open" && "New requests appear in real time."}</p>
          <Button asChild className="mt-4 bg-gold text-white font-bold"><Link to="/post-requirement">Post your requirement</Link></Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map(r => <Card key={r.id} r={r} mine={r.user_id === user.id} isProvider={isProvider} busy={busy === r.id} onAccept={accept} onClose={close} />)}
        </ul>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`text-[11px] font-extrabold px-3 h-8 rounded-full whitespace-nowrap transition ${active ? "bg-white text-gold" : "bg-white/15 text-white border border-white/30"}`}>{children}</button>;
}

function Card({ r, mine, isProvider, busy, onAccept, onClose }: {
  r: any; mine: boolean; isProvider: boolean; busy: boolean;
  onAccept: (r: any) => void; onClose: (r: any) => void;
}) {
  const age = timeAgo(r.created_at);
  const accepted = r.status === "accepted";
  const closed = r.status === "closed";
  const canSeeContact = mine || (isProvider && (r.accepted_by === null || accepted));

  return (
    <li className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-elevate transition">
      {/* Header strip — IndiaMART style */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-accent/60 to-mint/20 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="bg-navy text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">{r.work_type}</span>
          {accepted && <span className="bg-gold text-white text-[10px] font-extrabold px-2 py-0.5 rounded">✓ Accepted</span>}
          {closed && <span className="bg-muted text-muted-foreground text-[10px] font-extrabold px-2 py-0.5 rounded">Closed</span>}
        </div>
        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" />{age}</span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h3 className="font-display font-extrabold text-navy text-base leading-tight">{r.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3" />{r.city ?? "—"}
            </div>
          </div>
          {r.budget && (
            <div className="text-right shrink-0">
              <div className="font-display font-extrabold text-gold text-lg leading-none">₹{Number(r.budget).toLocaleString("en-IN")}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Budget</div>
            </div>
          )}
        </div>

        <p className="text-sm text-foreground/85 leading-relaxed mt-2 line-clamp-3">{r.description}</p>

        <div className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gold" />
          <span className={canSeeContact ? "" : "blur-[3px] select-none"}>{r.address}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {canSeeContact ? (
            <a href={`tel:${r.phone}`} className="flex items-center justify-center gap-1.5 h-10 rounded-lg border-2 border-gold text-gold font-extrabold text-sm">
              <Phone className="w-4 h-4" /> Call Now
            </a>
          ) : (
            <button disabled className="flex items-center justify-center gap-1.5 h-10 rounded-lg border-2 border-border text-muted-foreground font-bold text-xs">
              🔒 Contact hidden
            </button>
          )}

          {mine ? (
            !closed && <Button onClick={() => onClose(r)} disabled={busy} variant="outline" className="h-10 font-extrabold text-sm">Mark Closed</Button>
          ) : isProvider && !accepted && !closed ? (
            <Button onClick={() => onAccept(r)} disabled={busy} className="h-10 bg-gold hover:bg-gold-deep text-white font-extrabold text-sm">
              {busy ? "…" : "✓ Accept Job"}
            </Button>
          ) : accepted ? (
            <div className="flex items-center justify-center gap-1.5 h-10 rounded-lg bg-accent text-gold font-extrabold text-sm">
              <CheckCircle2 className="w-4 h-4" /> Taken
            </div>
          ) : (
            <div className="flex items-center justify-center h-10 text-xs text-muted-foreground font-bold">Customer post</div>
          )}
        </div>
      </div>
    </li>
  );
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
