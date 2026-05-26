import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/joinus")({ component: JoinUs });

const cities = ["Delhi","Mumbai","Bangalore","Noida","Gurgaon","Hyderabad","Pune","Jaipur"];
const trades = ["Electrician","Plumber","Painter","Carpenter","AC Technician","Cleaner","Labour / Mistry","Renovation Expert"];

function JoinUs() {
  const [step, setStep] = useState<1|2|3>(1);
  const [role, setRole] = useState<"customer"|"provider">("customer");
  const [f, setF] = useState({ first_name:"", last_name:"", email:"", phone:"", city:"Delhi", trade:"", password:"", password2:"" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (f.password !== f.password2) return toast.error("Passwords don't match");
    if (role === "provider" && !f.trade) return toast.error("Select your trade");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: f.email, password: f.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { first_name: f.first_name, last_name: f.last_name, phone: f.phone, city: f.city, trade: f.trade || null, role },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Account created!"); setStep(3); }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
      <div className="bg-card rounded-2xl p-10 w-full max-w-lg shadow-elevate">
        <Link to="/" className="block text-center mb-6">
          <div className="font-display text-2xl font-extrabold text-navy">Vaas<span className="text-gold">kar</span></div>
        </Link>

        {step===1 && (
          <>
            <h1 className="font-display font-bold text-2xl text-navy">Join IndusWork</h1>
            <p className="text-sm text-muted-foreground mb-5">How do you want to join us?</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {([
                {k:"customer", emoji:"🏠", t:"As Customer", s:"Book home services"},
                {k:"provider", emoji:"🛠️", t:"As Service Provider", s:"Get paid jobs"},
              ] as const).map(o => (
                <button key={o.k} type="button" onClick={()=>setRole(o.k)}
                  className={`border-2 rounded-2xl p-5 text-center transition ${role===o.k?'border-gold bg-accent':'border-border hover:border-gold/50'}`}>
                  <div className="text-3xl mb-2">{o.emoji}</div>
                  <div className="font-display font-bold text-navy">{o.t}</div>
                  <div className="text-xs text-muted-foreground mt-1">{o.s}</div>
                </button>
              ))}
            </div>
            <Button onClick={()=>setStep(2)} className="w-full bg-navy hover:bg-gold text-white font-bold">Continue →</Button>
            <p className="text-center text-sm text-muted-foreground mt-5">Already have an account? <Link to="/login" className="text-gold font-bold">Login</Link></p>
          </>
        )}

        {step===2 && (
          <form onSubmit={register} className="space-y-4">
            <h1 className="font-display font-bold text-xl text-navy">Register as {role === "provider" ? "Service Provider" : "Customer"}</h1>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First Name *</Label><Input required value={f.first_name} onChange={e=>setF({...f,first_name:e.target.value})} /></div>
              <div><Label>Last Name</Label><Input value={f.last_name} onChange={e=>setF({...f,last_name:e.target.value})} /></div>
            </div>
            <div><Label>Email *</Label><Input type="email" required value={f.email} onChange={e=>setF({...f,email:e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone *</Label><Input required value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} /></div>
              <div><Label>City</Label>
                <select className="w-full border border-input rounded-md h-10 px-3 text-sm bg-background" value={f.city} onChange={e=>setF({...f,city:e.target.value})}>
                  {cities.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {role==="provider" && (
              <div><Label>Your Trade *</Label>
                <select className="w-full border border-input rounded-md h-10 px-3 text-sm bg-background" value={f.trade} onChange={e=>setF({...f,trade:e.target.value})}>
                  <option value="">Select your skill</option>
                  {trades.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Password *</Label><Input type="password" required value={f.password} onChange={e=>setF({...f,password:e.target.value})} /></div>
              <div><Label>Confirm</Label><Input type="password" required value={f.password2} onChange={e=>setF({...f,password2:e.target.value})} /></div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-gold text-white font-bold">{loading?"Creating...":"Create Account ✓"}</Button>
            <button type="button" onClick={()=>setStep(1)} className="w-full text-sm text-gold font-bold">← Change role</button>
          </form>
        )}

        {step===3 && (
          <div className="text-center py-4">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="font-display font-bold text-2xl text-navy">Account Created!</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-6">Welcome to the IndusWork family. You can now log in.</p>
            <Button onClick={()=>navigate({to:"/login"})} className="w-full bg-navy hover:bg-gold text-white font-bold">Go to Login →</Button>
          </div>
        )}
      </div>
    </div>
  );
}
