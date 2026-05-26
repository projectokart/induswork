import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Repeat2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type Booking = {
  id: string; service_name: string; status: string; created_at: string;
  city: string | null; address: string | null; price: number | null;
};

function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  const load = () => {
    if (!user) return;
    supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setBookings((data ?? []) as Booking[]));
    supabase.from("user_roles").select("role").eq("user_id", user.id)
      .then(({ data }) => setIsAdmin((data ?? []).some(r => r.role === "admin")));
  };
  useEffect(load, [user]);

  const rebook = async (b: Booking) => {
    if (!user) return;
    setBusy(b.id);
    const { data, error } = await supabase.from("bookings").insert({
      user_id: user.id, service_name: b.service_name, status: "Pending",
      city: b.city, address: b.address, notes: `Rebooked from previous`,
    }).select("id").maybeSingle();
    setBusy(null);
    if (error || !data) return toast.error(error?.message ?? "Failed");
    toast.success("Rebooked! Fill in date/time on the booking page.");
    navigate({ to: "/booking/$id", params: { id: data.id } });
  };

  const stats = useMemo(() => {
    const completed = bookings.filter(b => b.status === "Completed");
    const pending = bookings.filter(b => b.status === "Pending" || b.status === "Accepted").length;
    const spent = completed.reduce((s, b) => s + (Number(b.price) || 0), 0);
    const services = new Set(completed.map(b => b.service_name)).size;
    return { completed: completed.length, pending, spent, services };
  }, [bookings]);

  const savedAddresses = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach(b => { if (b.address) set.add(b.address); });
    return Array.from(set).slice(0, 3);
  }, [bookings]);

  if (!user) return null;
  const isProvider = profile?.role === "provider";
  const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="gradient-hero rounded-2xl p-7 text-white flex items-center justify-between mb-7 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Welcome back, {profile?.first_name ?? "User"}!</h1>
          <p className="text-sm opacity-80 mt-1">{isProvider ? `Service Provider${profile?.trade ? ` · ${profile.trade}` : ""}` : "Customer Account"} · {profile?.city ?? "—"}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate({ to: "/profile" })} className="bg-white/15 hover:bg-white/25 border border-white/30 text-white">Edit Profile</Button>
          <Button onClick={async () => { await signOut(); toast.success("Logged out"); navigate({ to: "/" }); }} className="bg-white/15 hover:bg-white/25 border border-white/30 text-white">Logout ↗</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        <Stat n={bookings.length} l="Total Bookings" />
        <Stat n={stats.completed} l="Completed" />
        <Stat n={stats.pending} l="Pending" tint="text-amber-500" />
        <Stat n={inr(stats.spent)} l="Total Spent" tint="text-mint" />
      </div>

      {savedAddresses.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-display font-bold text-navy mb-3">Saved Addresses</h2>
          <ul className="space-y-2">
            {savedAddresses.map((a, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-gold">📍</span><span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="font-display font-bold text-navy mb-4">Booking History</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet. <Link to="/services" className="text-gold font-bold">Browse services →</Link></p>
        ) : (
          <ul className="divide-y divide-border">
            {bookings.map(b => (
              <li key={b.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-navy text-sm">{b.service_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    {b.city ? ` · ${b.city}` : ""}
                    {b.price ? ` · ${inr(Number(b.price))}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    b.status==="Completed" ? "bg-accent text-gold" :
                    b.status==="Accepted"  ? "bg-blue-100 text-blue-700" :
                    b.status==="Cancelled" || b.status==="Rejected" ? "bg-red-100 text-red-700" :
                                             "bg-amber-100 text-amber-700"
                  }`}>{b.status}</span>
                  {(b.status==="Completed" || b.status==="Cancelled") && (
                    <Button size="sm" disabled={busy === b.id} onClick={() => rebook(b)} className="bg-gold hover:bg-gold-deep text-white text-xs font-bold">
                      <Repeat2 className="w-3 h-3 mr-1" />{busy===b.id?"…":"Rebook"}
                    </Button>
                  )}
                  <Link to="/booking/$id" params={{ id: b.id }} className="text-xs font-bold text-gold">View →</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-display font-bold text-navy mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate({ to: "/services" })} className="bg-gold hover:bg-gold-deep text-white font-bold">📋 Book a Service</Button>
          <Button onClick={() => navigate({ to: "/contact" })} variant="outline" className="border-2 border-navy text-navy font-bold">📞 Contact Support</Button>
          {isProvider && (
            <Button onClick={() => navigate({ to: "/provider" })} className="bg-navy hover:bg-navy-deep text-white font-bold">🧰 Provider Dashboard</Button>
          )}
          {isAdmin && (
            <>
              <Button onClick={() => navigate({ to: "/admin" })} className="bg-navy hover:bg-navy-deep text-white font-bold">🛡 Admin Panel</Button>
              <Button onClick={() => navigate({ to: "/admin/analytics" })} className="bg-gold hover:bg-gold-deep text-white font-bold">📊 Analytics</Button>
            </>
          )}
        </div>
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
