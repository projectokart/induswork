import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/services-data";
import heroElec from "@/assets/hero-electrical.jpg";
import heroPaint from "@/assets/hero-painting.jpg";
import heroClean from "@/assets/hero-cleaning.jpg";
import heroReno from "@/assets/hero-renovation.jpg";
import heroLab from "@/assets/hero-labour.jpg";
import avRahul from "@/assets/avatar-rahul.jpg";
import avSneha from "@/assets/avatar-sneha.jpg";
import avAnjali from "@/assets/avatar-anjali.jpg";
import avMohit from "@/assets/avatar-mohit.jpg";
import avPriya from "@/assets/avatar-priya.jpg";
import avVikram from "@/assets/avatar-vikram.jpg";
import { Search, MapPin, Star, ShieldCheck, Clock, BadgeCheck, Wallet, MessageSquarePlus } from "lucide-react";
import { LiveStatsStrip } from "@/components/site/LiveStatsStrip";
import { QuoteDialog } from "@/components/site/QuoteDialog";

export const Route = createFileRoute("/")({ component: Home });

const slides = [
  { img: heroElec, badge: "⭐ Trusted by 50,000+ Homes", title: <>Expert <span className="text-mint">Electrical</span> & Plumbing<br/>At Your Doorstep</>, sub: "Verified professionals, fixed prices, 100% satisfaction", cta: "Book a Service" },
  { img: heroPaint, badge: "🎨 Professional Painters", title: <>Transform Your Home with <span className="text-mint">Premium Painting</span></>, sub: "Interior, exterior & texture work — all included", cta: "Get Free Quote" },
  { img: heroClean, badge: "🧹 Deep Cleaning Experts", title: <><span className="text-mint">Spotless Home</span> in Just a Few Hours</>, sub: "Deep clean, sofa cleaning, pest control & more", cta: "Book Cleaning" },
  { img: heroReno, badge: "🏗️ Renovation Specialists", title: <>Full Home <span className="text-mint">Renovation</span> Done Right</>, sub: "Flooring, tiling, false ceiling, waterproofing & more", cta: "Start Renovation" },
  { img: heroLab, badge: "👷 Reliable Labour", title: <>Skilled <span className="text-mint">Labour Work</span> On-Demand</>, sub: "Loading, shifting, demolition & daily mistry work", cta: "Hire Labour" },
];

const reviews = [
  { name: "Rahul Verma", svc: "Electrical Repair · Delhi", text: "Electrician aaya 45 mins mein. Koi extra charge nahi, koi drama nahi. IndusWork pe trust ho gaya!", img: avRahul },
  { name: "Sneha Kapoor", svc: "Home Repair · Gurgaon", text: "Bathroom tile 2 ghante mein fix ho gayi. Clean work, zero mess. Highly recommend IndusWork!", img: avSneha },
  { name: "Anjali Singh", svc: "Painting · Noida", text: "Ghar ki painting 3 rooms mein 2 din mein done. Quality paints aur price bhi bilkul sahi tha!", img: avAnjali },
  { name: "Mohit Sharma", svc: "AC Servicing · Mumbai", text: "AC servicing wale bahut professional the. Time pe aaye, kaam ache se kiya.", img: avMohit },
  { name: "Priya Mehta", svc: "Deep Cleaning · Bangalore", text: "Deep cleaning service ne ghar bilkul chamka diya. Kitchen aur bathroom ekdum fresh!", img: avPriya },
  { name: "Vikram Rao", svc: "Labour Work · Hyderabad", text: "Shifting ka kaam bahut asaan ho gaya IndusWork ki wajah se. Labour team fast aur careful thi.", img: avVikram },
];

function Home() {
  const [idx, setIdx] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCity, setSearchCity] = useState("Delhi");
  useEffect(() => { const t = setInterval(() => setIdx(i => (i+1) % slides.length), 5000); return () => clearInterval(t); }, []);
  const s = slides[idx];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (q.length >= 1 && q.length <= 200) {
      // fire-and-forget log
      import("@/integrations/supabase/client").then(({ supabase }) => {
        supabase.from("search_queries").insert({ query: q, city: searchCity }).then(() => {});
      });
    }
    window.location.href = "/services";
  };

  return (
    <>
      {/* HERO — premium layered look */}
      <section className="relative h-[560px] md:h-[640px] overflow-hidden noise-overlay">
        {slides.map((sl, i) => (
          <img
            key={i}
            src={sl.img}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i===idx?'opacity-100 animate-ken-burns':'opacity-0'}`}
          />
        ))}
        {/* Aurora wash */}
        <div className="absolute inset-0 gradient-aurora opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-transparent" />

        {/* Floating glass orbs */}
        <div className="hidden md:block absolute top-20 left-12 w-24 h-24 rounded-full glass animate-float" />
        <div className="hidden md:block absolute bottom-24 right-16 w-32 h-32 rounded-full glass animate-float" style={{animationDelay:'1.5s'}} />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <span key={idx} className="inline-flex items-center gap-1.5 glass text-white text-xs font-bold px-4 py-2 rounded-full animate-fade-up">
            {s.badge}
          </span>
          <h1 key={`t-${idx}`} className="mt-5 text-white font-display font-extrabold text-4xl md:text-6xl leading-[1.05] text-balance max-w-4xl animate-fade-up delay-100">
            {s.title}
          </h1>
          <p key={`s-${idx}`} className="mt-4 text-white/90 text-base md:text-xl max-w-2xl animate-fade-up delay-200">{s.sub}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-up delay-300">
            <Link to="/services" className="relative inline-flex items-center justify-center bg-gold hover:bg-gold-deep text-white font-extrabold px-8 py-4 rounded-xl shadow-premium transition-transform hover:-translate-y-0.5">
              <span className="absolute inset-0 rounded-xl animate-shimmer pointer-events-none" />
              <span className="relative">{s.cta} →</span>
            </Link>
            <Link to="/providers" className="inline-flex items-center justify-center glass text-white font-bold px-7 py-4 rounded-xl hover:bg-white/20 transition">
              Browse Pros
            </Link>
          </div>

          <div className="absolute bottom-5 flex gap-2">
            {slides.map((_,i) => (
              <button key={i} onClick={()=>setIdx(i)} aria-label={`Slide ${i+1}`}
                className={`h-1.5 rounded-full transition-all ${i===idx?'w-8 bg-white shadow-glow':'w-2 bg-white/40 hover:bg-white/70'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH — floating glass card overlapping hero */}
      <section className="px-4 md:px-6 -mt-12 relative z-20">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl shadow-premium p-2 md:p-3">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch bg-card rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 md:border-r border-border">
              <MapPin className="w-4 h-4 text-gold" />
              <select value={searchCity} onChange={e=>setSearchCity(e.target.value)} className="bg-transparent text-sm font-bold text-foreground py-3 outline-none w-full">
                {["Delhi","Mumbai","Bangalore","Noida","Gurgaon","Hyderabad","Pune","Jaipur"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 flex items-center gap-2 px-4 border-t md:border-t-0 border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} maxLength={200} placeholder="Try: AC service, deep cleaning, electrician…" className="flex-1 py-4 bg-transparent outline-none text-sm" />
            </div>
            <button className="bg-navy hover:bg-gold text-white font-extrabold px-7 py-4 text-sm transition-colors">Search</button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* CATEGORIES */}
        <section className="pt-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] font-extrabold text-gold bg-accent px-3 py-1 rounded-full tracking-[0.18em]">ALL SERVICES</span>
              <h2 className="mt-3 font-display font-extrabold text-3xl md:text-4xl text-navy">Our <span className="text-gradient-gold">Service Categories</span></h2>
            </div>
            <Link to="/services" className="hidden sm:inline text-sm font-extrabold text-navy hover:text-gold">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c, i) => (
              <Link
                to="/services"
                key={c.key}
                className="group relative bg-card rounded-2xl border border-border p-6 text-center hover-lift overflow-hidden"
                style={{animation: `fadeUp .6s ${i*0.05}s cubic-bezier(.2,.8,.2,1) both`}}
              >
                <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gold/10 group-hover:bg-gold/20 transition" />
                <div className="relative w-20 h-20 rounded-2xl mx-auto mb-3 overflow-hidden ring-2 ring-border group-hover:ring-gold group-hover:scale-110 transition" style={{background:c.tint}}>
                  <img src={c.icon} alt={c.title} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="relative font-display font-bold text-navy">{c.title}</div>
                <div className="relative text-xs text-muted-foreground font-semibold mt-1">{c.items.length} services</div>
              </Link>
            ))}
          </div>
        </section>

        {/* REVIEWS — marquee */}
        <section className="pt-16">
          <div className="text-center mb-8">
            <span className="text-[11px] font-extrabold text-gold bg-accent px-3 py-1 rounded-full tracking-[0.18em]">REVIEWS</span>
            <h2 className="mt-3 font-display font-extrabold text-3xl md:text-4xl text-navy">Loved by <span className="text-gradient-gold">50,000+ homes</span></h2>
          </div>
          <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <div className="flex gap-5 marquee-track w-max">
              {[...reviews, ...reviews].map((r, i) => (
                <div key={i} className="shrink-0 w-[320px] bg-card rounded-2xl p-6 border border-border shadow-soft hover-lift">
                  <div className="flex text-amber-400 mb-2">{[...Array(5)].map((_,k)=><Star key={k} className="w-4 h-4 fill-current" />)}</div>
                  <p className="text-sm leading-relaxed text-foreground/80">"{r.text}"</p>
                  <div className="flex items-center gap-3 mt-4">
                    <img src={r.img} alt={r.name} loading="lazy" width={44} height={44} className="w-11 h-11 rounded-full object-cover ring-2 ring-gold/30" />
                    <div>
                      <div className="font-bold text-navy text-sm">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.svc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* LIVE STATS */}
      <div className="mt-14"><LiveStatsStrip /></div>

      {/* POST REQUIREMENT CTA — public marketplace board */}
      <section className="px-6 py-14">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5">
          <Link to="/post-requirement" className="group bg-gradient-to-br from-gold to-gold-deep rounded-2xl p-7 text-white shadow-elevate hover:-translate-y-1 transition">
            <div className="text-4xl mb-3">📢</div>
            <h3 className="font-display font-extrabold text-xl">Post Your Requirement</h3>
            <p className="opacity-90 text-sm mt-1.5">Name, address &amp; requirement daalo — verified providers turant contact karenge.</p>
            <span className="inline-block mt-4 bg-white text-gold font-extrabold text-xs px-4 py-2 rounded-full group-hover:bg-mint">Post Now →</span>
          </Link>
          <Link to="/requirements" className="group bg-gradient-to-br from-navy to-navy-deep rounded-2xl p-7 text-white shadow-elevate hover:-translate-y-1 transition">
            <div className="text-4xl mb-3">🔥</div>
            <h3 className="font-display font-extrabold text-xl">Live Customer Demand</h3>
            <p className="opacity-90 text-sm mt-1.5">Providers — browse open jobs in your city &amp; accept work instantly.</p>
            <span className="inline-block mt-4 bg-mint text-navy font-extrabold text-xs px-4 py-2 rounded-full group-hover:bg-white">See Demand →</span>
          </Link>
        </div>
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-gold to-gold-deep rounded-2xl p-8 md:p-10 text-center text-white shadow-elevate mt-6">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl">Need a quick quote? <span className="text-mint">Talk to us.</span></h2>
          <p className="mt-2 opacity-90 text-sm md:text-base">IndusWork team will contact you within 30 minutes.</p>
          <div className="mt-6">
            <QuoteDialog trigger={
              <button className="inline-flex items-center gap-2 bg-white text-navy font-extrabold px-7 py-3.5 rounded-xl hover:bg-mint hover:text-white transition">
                <MessageSquarePlus className="w-5 h-5" /> Request a Service
              </button>
            } />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-navy mt-16 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {Icon: BadgeCheck, t:"Verified Professionals", s:"Background-checked experts"},
            {Icon: ShieldCheck, t:"Service Guarantee", s:"Free redo if not satisfied"},
            {Icon: Clock, t:"On-Time Arrival", s:"Always on your schedule"},
            {Icon: Wallet, t:"Fixed Pricing", s:"No hidden charges ever"},
          ].map(({Icon,t,s},i)=>(
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center"><Icon className="text-mint w-5 h-5" /></div>
              <div><div className="text-white font-bold text-sm">{t}</div><div className="text-white/55 text-xs">{s}</div></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
