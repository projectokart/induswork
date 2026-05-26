import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2, Megaphone } from "lucide-react";

export const Route = createFileRoute("/post-requirement")({
  head: () => ({
    meta: [
      { title: "Post Your Requirement — IndusWork" },
      { name: "description", content: "Tell us what you need. Verified providers will see your request and respond." },
    ],
  }),
  component: PostRequirement,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, "Invalid phone"),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  address: z.string().trim().min(5, "Address too short").max(300),
  work_type: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10, "Describe in 10+ chars").max(1000),
  budget: z.string().trim().max(10).optional().or(z.literal("")),
});

function PostRequirement() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({
    name: "", phone: "", city: "", address: "", work_type: "", description: "", budget: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (profile) setF((p) => ({
      ...p,
      name: p.name || [profile.first_name, profile.last_name].filter(Boolean).join(" "),
      city: p.city || (profile.city ?? ""),
    }));
  }, [profile]);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(f);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("requirements").insert({
      user_id: user.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      city: parsed.data.city || null,
      address: parsed.data.address,
      work_type: parsed.data.work_type,
      description: parsed.data.description,
      budget: parsed.data.budget ? Number(parsed.data.budget) : null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
  };

  if (done) return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      <div className="bg-card border border-border rounded-2xl p-10 shadow-elevate">
        <CheckCircle2 className="w-16 h-16 text-gold mx-auto mb-4" />
        <h1 className="font-display font-extrabold text-2xl text-navy">Requirement Posted!</h1>
        <p className="text-muted-foreground mt-3">Verified providers will see your request and respond. IndusWork team aapse jaldi contact karega.</p>
        <div className="flex gap-3 justify-center mt-7">
          <Button onClick={() => { setDone(false); setF({ name: f.name, phone: f.phone, city: f.city, address: "", work_type: "", description: "", budget: "" }); }} variant="outline" className="font-bold">Post Another</Button>
          <Button asChild className="bg-navy hover:bg-gold text-white font-bold"><Link to="/dashboard">Go to Dashboard</Link></Button>
        </div>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="gradient-hero rounded-2xl p-7 text-white mb-6 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <Megaphone className="w-8 h-8" />
          <div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl">Post Your Requirement</h1>
            <p className="opacity-85 text-sm mt-1">Tell us what you need — verified providers reach out within minutes.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field id="name" label="Your Name *">
            <Input id="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Full name" />
          </Field>
          <Field id="phone" label="Phone Number *">
            <Input id="phone" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91 9876543210" />
          </Field>
          <Field id="city" label="City">
            <Input id="city" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Delhi" />
          </Field>
          <Field id="work_type" label="Work Type *">
            <Input id="work_type" value={f.work_type} onChange={(e) => setF({ ...f, work_type: e.target.value })} placeholder="e.g. Electrical, Plumbing, Painting" list="worktypes" />
            <datalist id="worktypes">
              {["Electrical","Plumbing","Painting","Deep Cleaning","AC Service","Carpentry","Tile/Flooring","False Ceiling","Pest Control","Labour/Shifting","Renovation"].map(w => <option key={w} value={w} />)}
            </datalist>
          </Field>
        </div>

        <Field id="address" label="Address *">
          <Textarea id="address" rows={2} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="House/flat no, street, area, landmark" />
        </Field>

        <Field id="description" label="Requirement Details *">
          <Textarea id="description" rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Describe the work — what's broken, scope, urgency, materials, etc." />
        </Field>

        <Field id="budget" label="Approx Budget (₹) — optional">
          <Input id="budget" inputMode="numeric" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value.replace(/[^0-9]/g, "") })} placeholder="e.g. 2000" />
        </Field>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={busy} size="lg" className="bg-gold hover:bg-gold-deep text-white font-extrabold flex-1">
            {busy ? "Posting…" : "📢 Post Requirement"}
          </Button>
          <Button asChild type="button" variant="outline" size="lg" className="font-bold"><Link to="/dashboard">Cancel</Link></Button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">By posting, your details are shared only with verified providers who accept your request.</p>
      </form>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-extrabold uppercase tracking-wide text-navy">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
