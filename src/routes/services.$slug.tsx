import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { categories } from "@/lib/services-data";
import { slugify } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, Clock, Shield, Star, MapPin } from "lucide-react";

export const Route = createFileRoute("/services/$slug")({
  head: ({ params }) => {
    const svc = findService(params.slug);
    const title = svc ? `${svc.name} — IndusWork` : "Service — IndusWork";
    const desc = svc?.desc ?? "Professional services across India.";
    return { meta: [
      { title }, { name: "description", content: desc },
      { property: "og:title", content: title }, { property: "og:description", content: desc },
      ...(svc ? [{ property: "og:image", content: svc.img }] : []),
    ]};
  },
  loader: ({ params }) => {
    const svc = findService(params.slug);
    if (!svc) throw notFound();
    return svc;
  },
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h1 className="font-display font-extrabold text-2xl text-navy">Service not found</h1>
      <Link to="/services" className="text-gold font-bold mt-3 inline-block">← Back to all services</Link>
    </div>
  ),
  component: ServiceDetail,
});

function findService(slug: string) {
  for (const cat of categories) {
    for (const it of cat.items) if (slugify(it.name) === slug) return { ...it, category: cat.title, categoryKey: cat.key, tint: cat.tint, emoji: cat.emoji };
  }
  return null;
}

function ServiceDetail() {
  const svc = Route.useLoaderData();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const book = async () => {
    if (!user) { toast.info("Please login to book"); navigate({ to: "/login" }); return; }
    const { data, error } = await supabase.from("bookings")
      .insert({ user_id: user.id, service_name: svc.name, status: "Pending", city: profile?.city ?? null })
      .select("id").single();
    if (error || !data) { toast.error(error?.message ?? "Could not create booking"); return; }
    toast.success(`${svc.name} booked!`);
    navigate({ to: "/booking/$id", params: { id: data.id } });
  };

  const related = categories.find(c => c.key === svc.categoryKey)?.items.filter(i => i.name !== svc.name).slice(0, 3) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <nav className="text-xs text-muted-foreground mb-5">
        <Link to="/" className="hover:text-gold">Home</Link> / <Link to="/services" className="hover:text-gold">Services</Link> / <span className="text-navy font-semibold">{svc.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        <img src={svc.img} alt={svc.name} className="w-full h-80 object-cover rounded-2xl shadow-elevate" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3" style={{background:svc.tint, color:"#0a3d4f"}}>
            <span>{svc.emoji}</span><span>{svc.category}</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-navy">{svc.name}</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">{svc.desc}</p>

          <div className="flex items-center gap-4 mt-5">
            <div className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-current" /><span className="font-bold text-navy">4.8</span></div>
            <span className="text-xs text-muted-foreground">·  2,400+ bookings</span>
            <span className="text-xs font-bold text-gold bg-accent px-3 py-1 rounded-full">{svc.price}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <Feature icon={<Shield className="w-5 h-5" />} label="Verified Pros" />
            <Feature icon={<Clock className="w-5 h-5" />} label="On-time Visit" />
            <Feature icon={<CheckCircle2 className="w-5 h-5" />} label="Service Warranty" />
          </div>

          <div className="flex gap-3 mt-7">
            <Button onClick={book} size="lg" className="bg-navy hover:bg-gold text-white font-bold flex-1">Book Now</Button>
            <Button asChild variant="outline" size="lg" className="font-bold"><Link to="/contact">Get Quote</Link></Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <Card title="What's Included">
          <ul className="space-y-2 text-sm">
            {includedFor(svc.name).map(x => (
              <li key={x} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" /><span>{x}</span></li>
            ))}
          </ul>
        </Card>
        <Card title="Pricing">
          <div className="text-2xl font-extrabold text-navy">{svc.price}</div>
          <p className="text-xs text-muted-foreground mt-2">Final price depends on scope, materials and city. A free on-site inspection is provided before any chargeable work.</p>
          <ul className="text-xs text-muted-foreground mt-3 space-y-1">
            <li>• No hidden charges</li>
            <li>• GST extra as applicable</li>
            <li>• Free re-visit within 7 days</li>
          </ul>
        </Card>
        <Card title="How It Works">
          <ol className="text-sm space-y-2">
            <li><b className="text-navy">1.</b> Book online or call us</li>
            <li><b className="text-navy">2.</b> Verified pro confirms slot</li>
            <li><b className="text-navy">3.</b> Service done at your home</li>
            <li><b className="text-navy">4.</b> Pay after satisfaction</li>
          </ol>
        </Card>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="font-display font-extrabold text-xl text-navy mb-4">Related services</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map(r => (
              <Link key={r.name} to="/services/$slug" params={{ slug: slugify(r.name) }} className="bg-card border border-border rounded-xl overflow-hidden hover:border-gold hover:-translate-y-1 transition">
                <img src={r.img} alt={r.name} className="w-full h-32 object-cover" />
                <div className="p-3">
                  <div className="font-bold text-navy text-sm">{r.name}</div>
                  <div className="text-xs text-gold font-extrabold mt-1">{r.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-accent/40 text-gold text-center"><span>{icon}</span><span className="text-[11px] font-bold text-navy">{label}</span></div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-card border border-border rounded-xl p-5 shadow-soft"><h3 className="font-display font-bold text-navy mb-3">{title}</h3>{children}</div>;
}
function includedFor(name: string): string[] {
  const lower = name.toLowerCase();
  if (lower.includes("electric")) return ["Wiring inspection", "Switch/socket replacement", "MCB & fuse fix", "Fan & light install", "Earthing check"];
  if (lower.includes("plumb")) return ["Leak detection", "Tap & shower install", "Drain unblocking", "Geyser fitting", "Pipe replacement"];
  if (lower.includes("ac")) return ["Filter cleaning", "Gas check & refill", "Drain pipe clean", "Cooling test", "Install/uninstall"];
  if (lower.includes("paint")) return ["Surface prep & putty", "Primer coat", "2 coats of paint", "Tape & cover furniture", "Post-work cleanup"];
  if (lower.includes("clean")) return ["Floor & wall wipe", "Bathroom descaling", "Kitchen degrease", "Window & glass shine", "Dusting & vacuuming"];
  if (lower.includes("til") || lower.includes("floor")) return ["Old tile removal", "Surface levelling", "Tile laying", "Grouting & finishing", "Debris removal"];
  if (lower.includes("ceiling")) return ["Design consultation", "Frame & board fitting", "Cove lighting prep", "Finish & paint-ready", "Cleanup"];
  if (lower.includes("pest")) return ["Site inspection", "Safe chemical spray", "Crack & crevice treatment", "Post-service report", "Warranty"];
  if (lower.includes("shift") || lower.includes("load")) return ["Packing materials", "Loading labour", "Transport (on request)", "Unloading", "Basic arrangement"];
  return ["On-site inspection", "Material guidance", "Skilled labour", "Quality finish", "Post-work cleanup"];
}
