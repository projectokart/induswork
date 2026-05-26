import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/provider")({
  head: () => ({ meta: [{ title: "Provider Dashboard — IndusWork" }] }),
  component: ProviderDashboard,
});

type Job = {
  id: string;
  user_id: string;
  service_name: string;
  status: string;
  city: string | null;
  address: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  provider_id: string | null;
  notes: string | null;
  created_at: string;
  price: number | null;
};

function ProviderDashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [openJobs, setOpenJobs] = useState<Job[]>([]);
  const [mine, setMine] = useState<Job[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState("");
  const [priceInput, setPriceInput] = useState<Record<string, string>>({});

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);
  useEffect(() => {
    if (!loading && profile && profile.role !== "provider") {
      toast.error("Provider account required");
      navigate({ to: "/dashboard" });
    }
  }, [loading, profile, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    const jobs = (data ?? []) as Job[];
    setOpenJobs(jobs.filter(j => j.provider_id === null && j.status === "Pending"));
    setMine(jobs.filter(j => j.provider_id === user.id));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const notify = async (toUser: string, bookingId: string, title: string, body: string, type: string) => {
    await supabase.from("notifications").insert({ user_id: toUser, booking_id: bookingId, title, body, type, link: `/booking/${bookingId}` });
  };

  const accept = async (j: Job) => {
    if (!user) return;
    setBusy(j.id);
    const { error } = await supabase.from("bookings")
      .update({ provider_id: user.id, status: "Accepted" })
      .eq("id", j.id).is("provider_id", null);
    setBusy(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Job accepted");
      notify(j.user_id, j.id, "Booking accepted ✅", `Your ${j.service_name} request was accepted. Provider will contact you shortly.`, "booking_accepted");
      load();
    }
  };

  const reject = async (j: Job) => {
    setBusy(j.id);
    const { error } = await supabase.from("bookings")
      .update({ status: "Rejected", provider_id: user!.id })
      .eq("id", j.id);
    setBusy(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Job rejected");
      notify(j.user_id, j.id, "Provider unavailable", `Sorry, your ${j.service_name} request was declined. We're matching you with another pro.`, "booking_rejected");
      load();
    }
  };

  const complete = async (j: Job) => {
    const priceStr = priceInput[j.id] ?? (j.price?.toString() ?? "");
    const price = parseFloat(priceStr);
    if (!price || price <= 0) return toast.error("Enter the final price first");
    setBusy(j.id);
    const { error } = await supabase.from("bookings")
      .update({ status: "Completed", price })
      .eq("id", j.id);
    setBusy(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Marked complete");
      notify(j.user_id, j.id, "Service completed 🎉", `Your ${j.service_name} is marked complete. Final price: ₹${price}. Please rate your experience.`, "booking_completed");
      load();
    }
  };

  const filteredOpen = useMemo(() =>
    cityFilter ? openJobs.filter(j => (j.city ?? "").toLowerCase().includes(cityFilter.toLowerCase())) : openJobs,
  [openJobs, cityFilter]);

  const stats = useMemo(() => {
    const accepted = mine.filter(j => j.status === "Accepted").length;
    const completed = mine.filter(j => j.status === "Completed");
    const rejected = mine.filter(j => j.status === "Rejected").length;
    const totalEarn = completed.reduce((s, j) => s + (Number(j.price) || 0), 0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
    const monthEarn = completed.filter(j => new Date(j.created_at) >= monthStart).reduce((s, j) => s + (Number(j.price)||0), 0);
    const weekEarn = completed.filter(j => new Date(j.created_at) >= weekStart).reduce((s, j) => s + (Number(j.price)||0), 0);
    const total = accepted + completed.length + rejected;
    const acceptRate = total ? Math.round(((accepted + completed.length) / total) * 100) : 0;
    return { accepted, completedCount: completed.length, rejected, totalEarn, monthEarn, weekEarn, acceptRate };
  }, [mine]);

  if (!user || profile?.role !== "provider") return null;

  const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="gradient-hero rounded-2xl p-7 text-white mb-7">
        <h1 className="font-display font-bold text-2xl">Provider Dashboard</h1>
        <p className="text-sm opacity-80 mt-1">Welcome {profile?.first_name} {profile?.trade ? `· ${profile.trade}` : ""}</p>
      </div>

      {/* EARNINGS */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <Stat n={inr(stats.totalEarn)} l="Total Earnings" tint="text-gold" />
        <Stat n={inr(stats.monthEarn)} l="This Month" tint="text-mint" />
        <Stat n={inr(stats.weekEarn)} l="This Week" tint="text-amber-500" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        <Stat n={filteredOpen.length} l="Open Jobs" />
        <Stat n={stats.accepted} l="In Progress" />
        <Stat n={stats.completedCount} l="Completed" />
        <Stat n={stats.acceptRate + "%"} l="Acceptance" />
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="font-display font-bold text-navy">Incoming Jobs</h2>
          <Input placeholder="Filter by city…" value={cityFilter} onChange={e=>setCityFilter(e.target.value)} className="max-w-[200px]" />
        </div>
        {filteredOpen.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open jobs right now. Check back soon!</p>
        ) : (
          <ul className="divide-y divide-border">
            {filteredOpen.map(j => (
              <JobRow key={j.id} j={j}>
                <Button size="sm" disabled={busy === j.id} onClick={() => accept(j)} className="bg-gold hover:bg-gold-deep text-white font-bold">
                  {busy === j.id ? "…" : "Accept"}
                </Button>
                <Button size="sm" variant="outline" disabled={busy === j.id} onClick={() => reject(j)} className="border-2 border-red-300 text-red-600 font-bold">
                  Reject
                </Button>
              </JobRow>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="font-display font-bold text-navy mb-4">My Jobs</h2>
        {mine.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't accepted any jobs yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {mine.map(j => (
              <JobRow key={j.id} j={j}>
                {j.status === "Accepted" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number" min="0" placeholder="₹ price"
                      value={priceInput[j.id] ?? ""}
                      onChange={e => setPriceInput(p => ({ ...p, [j.id]: e.target.value }))}
                      className="w-24 h-9"
                    />
                    <Button size="sm" disabled={busy === j.id} onClick={() => complete(j)} className="bg-navy hover:bg-navy-deep text-white font-bold">
                      {busy === j.id ? "…" : "Complete"}
                    </Button>
                  </div>
                )}
                {j.status === "Completed" && j.price != null && (
                  <span className="text-xs font-bold text-gold">{inr(Number(j.price))}</span>
                )}
                <Link to="/booking/$id" params={{ id: j.id }} className="text-xs font-bold text-gold">View →</Link>
              </JobRow>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ n, l, tint }: { n: number | string; l: string; tint?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 text-center shadow-soft">
      <div className={`font-display font-extrabold text-2xl ${tint ?? "text-gold"}`}>{n}</div>
      <div className="text-xs text-muted-foreground font-semibold mt-1">{l}</div>
    </div>
  );
}

function JobRow({ j, children }: { j: Job; children?: React.ReactNode }) {
  const status =
    j.status === "Completed" ? "bg-accent text-gold" :
    j.status === "Accepted"  ? "bg-blue-100 text-blue-700" :
    j.status === "Rejected"  ? "bg-red-100 text-red-700" :
                               "bg-amber-100 text-amber-700";
  return (
    <li className="py-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-bold text-navy text-sm">{j.service_name}</div>
        <div className="text-xs text-muted-foreground">
          {j.city ?? "—"} · {j.scheduled_date ?? "no date"} {j.scheduled_time ?? ""}
        </div>
        {j.address && <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">📍 {j.address}</div>}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${status}`}>{j.status}</span>
        {children}
      </div>
    </li>
  );
}
