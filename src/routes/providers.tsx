import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Phone, Star, Flag, MapPin, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/providers")({
  component: ProvidersPage,
  head: () => ({
    meta: [
      { title: "Verified Service Providers — IndusWork" },
      { name: "description", content: "Browse verified electricians, plumbers, painters and more. Call directly, see ratings, and report issues." },
    ],
  }),
});

type Provider = {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  trade: string | null;
  address: string | null;
  bio: string | null;
  avatar_url: string | null;
  services: string[] | null;
};

type Rating = { provider_id: string; stars: number };

function ProvidersPage() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id,first_name,last_name,phone,city,trade,address,bio,avatar_url,services")
      .eq("role", "provider")
      .order("created_at", { ascending: false });
    setProviders((data ?? []) as Provider[]);

    const { data: r } = await supabase.from("provider_ratings").select("provider_id,stars");
    const map: Record<string, { avg: number; count: number }> = {};
    (r ?? []).forEach((row: Rating) => {
      const m = map[row.provider_id] ?? { avg: 0, count: 0 };
      m.avg = (m.avg * m.count + row.stars) / (m.count + 1);
      m.count += 1;
      map[row.provider_id] = m;
    });
    setRatings(map);
  };
  useEffect(() => { load(); }, []);

  const cities = useMemo(() => Array.from(new Set(providers.map(p => p.city).filter(Boolean))) as string[], [providers]);

  const filtered = providers.filter(p => {
    const text = `${p.first_name} ${p.last_name ?? ""} ${p.trade ?? ""} ${(p.services ?? []).join(" ")}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (city && p.city !== city) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-4xl font-extrabold text-navy">Verified Service Providers</h1>
        <p className="text-muted-foreground text-sm mt-1">Call directly. Rate honestly. Report issues.</p>
      </div>

      <Card className="p-3 mb-5 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, trade or service…" className="pl-9" />
        </div>
        <select value={city} onChange={e => setCity(e.target.value)} className="border border-input rounded-md h-10 px-3 text-sm bg-background">
          <option value="">All cities</option>
          {cities.map(c => <option key={c}>{c}</option>)}
        </select>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No providers yet. <Link to="/joinus" className="text-gold font-bold">Join as a Pro →</Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProviderCard key={p.id} p={p} rating={ratings[p.id]} userId={user?.id ?? null} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProviderCard({ p, rating, userId, onChanged }:
  { p: Provider; rating?: { avg: number; count: number }; userId: string | null; onChanged: () => void }) {
  const name = `${p.first_name}${p.last_name ? " " + p.last_name : ""}`;
  const services = (p.services && p.services.length ? p.services : [p.trade]).filter(Boolean) as string[];
  const avg = rating?.avg ?? 0;

  return (
    <Card className="overflow-hidden flex flex-col hover-lift border-border/60 group">
      <div className="h-1.5 gradient-soft" />
      <div className="p-4 flex items-start gap-3">
        <div className="relative">
          <Avatar className="w-16 h-16 ring-2 ring-gold/30 shadow-soft">
            {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={name} /> : null}
            <AvatarFallback className="bg-navy text-white font-bold">{p.first_name[0]}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-mint border-2 border-card" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-navy truncate">{name}</h3>
            <Badge variant="secondary" className="bg-gold/10 text-gold text-[10px]">Verified</Badge>
          </div>
          {p.trade && <p className="text-xs font-bold text-muted-foreground mt-0.5">{p.trade}</p>}
          <div className="flex items-center gap-1 mt-1 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
            <span className="font-bold">{avg ? avg.toFixed(1) : "—"}</span>
            <span className="text-muted-foreground">({rating?.count ?? 0})</span>
          </div>
        </div>
      </div>

      {services.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {services.slice(0, 4).map(s => (
            <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-accent text-foreground">{s}</span>
          ))}
        </div>
      )}

      {(p.address || p.city) && (
        <div className="px-4 pb-3 text-xs text-muted-foreground flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{[p.address, p.city].filter(Boolean).join(", ")}</span>
        </div>
      )}

      {p.bio && <p className="px-4 pb-3 text-xs text-muted-foreground line-clamp-2">{p.bio}</p>}

      <div className="mt-auto p-3 border-t flex gap-2">
        {p.phone ? (
          <a href={`tel:${p.phone}`} className="flex-1">
            <Button className="w-full bg-gold hover:bg-gold-deep text-white font-bold">
              <Phone className="w-4 h-4" /> Call
            </Button>
          </a>
        ) : (
          <Button disabled className="flex-1">No phone</Button>
        )}
        <RateDialog providerId={p.id} userId={userId} onDone={onChanged} />
        <ReportDialog providerId={p.id} userId={userId} />
      </div>
    </Card>
  );
}

function RateDialog({ providerId, userId, onDone }: { providerId: string; userId: string | null; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!userId) return toast.error("Please login to rate");
    setBusy(true);
    const { error } = await supabase.from("provider_ratings")
      .upsert({ provider_id: providerId, rater_id: userId, stars, comment }, { onConflict: "provider_id,rater_id" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks for rating!");
    setOpen(false); onDone();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Rate"><Star className="w-4 h-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Rate this provider</DialogTitle></DialogHeader>
        <div className="flex gap-1 py-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} type="button" onClick={() => setStars(n)}>
              <Star className={`w-8 h-8 ${n <= stars ? "fill-amber-400 stroke-amber-400" : "stroke-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <Label>Comment (optional)</Label>
        <Textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={500} />
        <DialogFooter>
          <Button onClick={submit} disabled={busy} className="bg-gold text-white">Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReportDialog({ providerId, userId }: { providerId: string; userId: string | null }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!userId) return toast.error("Please login to report");
    setBusy(true);
    const { error } = await supabase.from("provider_reports")
      .insert({ provider_id: providerId, reporter_id: userId, reason, details });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Report submitted. Our team will review it.");
    setOpen(false); setDetails("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Report"><Flag className="w-4 h-4 text-destructive" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Report this provider</DialogTitle></DialogHeader>
        <Label>Reason</Label>
        <select value={reason} onChange={e => setReason(e.target.value)} className="border border-input rounded-md h-10 px-3 bg-background">
          <option value="spam">Spam</option>
          <option value="abuse">Abusive behaviour</option>
          <option value="fraud">Fraud / scam</option>
          <option value="poor_service">Poor service quality</option>
          <option value="no_show">Did not show up</option>
          <option value="other">Other</option>
        </select>
        <Label>Details</Label>
        <Textarea value={details} onChange={e => setDetails(e.target.value)} maxLength={1000} placeholder="What happened?" />
        <DialogFooter>
          <Button onClick={submit} disabled={busy} variant="destructive">Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
