import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Phone } from "lucide-react";

export const Route = createFileRoute("/booking/$id")({
  head: () => ({ meta: [{ title: "Booking — IndusWork" }] }),
  component: BookingDetail,
});

type Booking = {
  id: string;
  user_id: string;
  provider_id: string | null;
  service_name: string;
  status: string;
  city: string | null;
  notes: string | null;
  address: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  created_at: string;
};

function BookingDetail() {
  const { id } = Route.useParams();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [b, setB] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [counterpartPhone, setCounterpartPhone] = useState<string | null>(null);
  const [calls, setCalls] = useState<{ id: string; from_user: string; started_at: string }[]>([]);
  const [form, setForm] = useState({ scheduled_date: "", scheduled_time: "", address: "", city: "", notes: "" });

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  const load = async () => {
    const { data, error } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
    if (error) { toast.error(error.message); return; }
    if (!data) { toast.error("Booking not found"); return; }
    setB(data as Booking);
    setForm({
      scheduled_date: data.scheduled_date ?? "",
      scheduled_time: data.scheduled_time ?? "",
      address: data.address ?? "",
      city: data.city ?? "",
      notes: data.notes ?? "",
    });
    // counterpart phone (only visible once accepted)
    if (data.status === "Accepted" || data.status === "Completed") {
      const counterpartId = user?.id === data.user_id ? data.provider_id : data.user_id;
      if (counterpartId) {
        const { data: p } = await supabase.from("profiles").select("phone").eq("id", counterpartId).maybeSingle();
        setCounterpartPhone(p?.phone ?? null);
      }
    }
    // call history
    const { data: cl } = await supabase.from("call_logs").select("id,from_user,started_at").eq("booking_id", id).order("started_at", { ascending: false });
    setCalls((cl ?? []) as { id: string; from_user: string; started_at: string }[]);
  };

  useEffect(() => { if (user) load(); /* eslint-disable-next-line */ }, [user, id]);

  if (!user || !b) return <div className="max-w-3xl mx-auto px-6 py-16 text-center text-muted-foreground">Loading…</div>;

  const isOwner = b.user_id === user.id;
  const isProvider = profile?.role === "provider" && (b.provider_id === user.id || b.provider_id === null);
  const canEdit = isOwner && b.status !== "Completed" && b.status !== "Cancelled";

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("bookings").update({
      scheduled_date: form.scheduled_date || null,
      scheduled_time: form.scheduled_time || null,
      address: form.address || null,
      city: form.city || null,
      notes: form.notes || null,
    }).eq("id", b.id);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Booking updated"); load(); }
  };

  const cancel = async () => {
    setBusy(true);
    const { error } = await supabase.from("bookings").update({ status: "Cancelled" }).eq("id", b.id);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Booking cancelled"); load(); }
  };

  const statusColor =
    b.status === "Completed" ? "bg-accent text-gold" :
    b.status === "Accepted"  ? "bg-blue-100 text-blue-700" :
    b.status === "Cancelled" ? "bg-red-100 text-red-700" :
                               "bg-amber-100 text-amber-700";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/dashboard" className="text-sm text-gold font-bold">← Back to dashboard</Link>
      <div className="gradient-hero rounded-2xl p-7 text-white mt-3 mb-6">
        <div className="text-xs uppercase opacity-80 tracking-wider">Booking</div>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl mt-1">{b.service_name}</h1>
        <div className="flex items-center gap-3 mt-3">
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${statusColor}`}>{b.status}</span>
          <span className="text-xs opacity-80">Created {new Date(b.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span>
        </div>
      </div>

      {/* CALL / CONTACT */}
      {(b.status === "Accepted" || b.status === "Completed") && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{user.id === b.user_id ? "Your service provider" : "Customer"}</div>
            <div className="font-bold text-navy text-sm mt-1">{counterpartPhone ?? "Phone not available"}</div>
            {calls.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">{calls.length} call{calls.length>1?"s":""} logged · last {new Date(calls[0].started_at).toLocaleString("en-IN")}</div>
            )}
          </div>
          {counterpartPhone && (
            <a
              href={`tel:${counterpartPhone}`}
              onClick={async () => {
                const counterpartId = user.id === b.user_id ? b.provider_id : b.user_id;
                await supabase.from("call_logs").insert({
                  booking_id: b.id, from_user: user.id, to_user: counterpartId,
                  direction: user.id === b.user_id ? "client_to_provider" : "provider_to_client",
                });
                load();
              }}
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-deep text-white font-extrabold px-5 py-2.5 rounded-xl"
            >
              <Phone className="w-4 h-4" /> Call now
            </a>
          )}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">

        <h2 className="font-display font-bold text-navy">Service Details</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="d">Date</Label>
            <Input id="d" type="date" value={form.scheduled_date} disabled={!canEdit}
              onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="t">Time</Label>
            <Input id="t" type="time" value={form.scheduled_time} disabled={!canEdit}
              onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))} />
          </div>
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" value={form.city} disabled={!canEdit}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="e.g. Mumbai" />
        </div>

        <div>
          <Label htmlFor="addr">Service Address</Label>
          <Textarea id="addr" rows={3} value={form.address} disabled={!canEdit}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Flat / building / street / landmark" />
        </div>

        <div>
          <Label htmlFor="n">Notes for the technician</Label>
          <Textarea id="n" rows={3} value={form.notes} disabled={!canEdit}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Anything specific we should know?" />
        </div>

        {canEdit && (
          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={save} disabled={busy} className="bg-gold hover:bg-gold-deep text-white font-bold">
              {busy ? "Saving…" : "Save changes"}
            </Button>
            <Button onClick={cancel} disabled={busy} variant="outline" className="border-2 border-red-500 text-red-600 font-bold">
              Cancel booking
            </Button>
          </div>
        )}

        {isProvider && !isOwner && (
          <p className="text-xs text-muted-foreground pt-2">You're viewing this as a service provider. Manage status from the <Link to="/provider" className="text-gold font-bold">provider dashboard</Link>.</p>
        )}
      </div>
    </div>
  );
}
