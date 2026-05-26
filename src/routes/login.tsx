import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back!"); navigate({ to: "/dashboard" }); }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
      <div className="bg-card rounded-2xl p-10 w-full max-w-md shadow-elevate">
        <Link to="/" className="block text-center mb-6">
          <div className="font-display text-2xl font-extrabold text-navy">Vaas<span className="text-gold">kar</span></div>
          <div className="text-xs text-muted-foreground">— One fix for every Home —</div>
        </Link>
        <h1 className="font-display font-bold text-2xl text-navy">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-5">Log in to manage your bookings</p>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Email</Label><Input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" required value={password} onChange={e=>setPassword(e.target.value)} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-gold text-white font-bold">{loading?"Signing in...":"Sign In"}</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-5">
          New here? <Link to="/joinus" className="text-gold font-bold">Join Us</Link>
        </p>
      </div>
    </div>
  );
}
