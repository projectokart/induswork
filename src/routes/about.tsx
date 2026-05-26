import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — IndusWork" }, { name: "description", content: "Learn about IndusWork's mission to bring trustworthy home services to every Indian home." }] }),
  component: About,
});
function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="gradient-hero rounded-2xl p-12 text-white text-center mb-10">
        <h1 className="font-display font-extrabold text-4xl">About IndusWork</h1>
        <p className="mt-3 opacity-85">India's most trusted home services marketplace — built by Indians, for Indian homes.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-card rounded-xl p-7 border border-border">
          <h3 className="font-display font-bold text-navy text-lg mb-2">🎯 Our Mission</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Make professional home services as easy and reliable as ordering food. No haggling, no surprises — just verified experts at fixed prices.</p>
        </div>
        <div className="bg-card rounded-xl p-7 border border-border">
          <h3 className="font-display font-bold text-navy text-lg mb-2">💡 Our Vision</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">To be every Indian household's first call for home repair, renovation, cleaning and labour — across 100+ cities by 2027.</p>
        </div>
      </div>
      <h2 className="font-display font-extrabold text-2xl text-navy mb-5">Meet the team</h2>
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          {n:"Aarav Mehta", r:"Founder & CEO", c:"linear-gradient(135deg,#1D3557,#2952A3)"},
          {n:"Diya Kapoor", r:"Head of Operations", c:"linear-gradient(135deg,#1A9B7A,#0d6e55)"},
          {n:"Karthik Iyer", r:"Tech Lead", c:"linear-gradient(135deg,#7C3AED,#A78BFA)"},
        ].map(t=>(
          <div key={t.n} className="bg-card rounded-xl p-6 border border-border text-center">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-extrabold" style={{background:t.c}}>{t.n[0]}</div>
            <div className="mt-3 font-bold text-navy">{t.n}</div>
            <div className="text-xs text-muted-foreground">{t.r}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
