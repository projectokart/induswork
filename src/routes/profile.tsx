import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: ProfileEditor });

const TRADES = ["Electrician","Plumber","Painter","Carpenter","AC Technician","Cleaner","Labour / Mistry","Renovation Expert"];

function ProfileEditor() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({
    first_name: "", last_name: "", phone: "", city: "", trade: "",
    address: "", bio: "", services: [] as string[], avatar_url: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) setF(s => ({
      ...s,
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone: profile.phone || "",
      city: profile.city || "",
      trade: profile.trade || "",
      // @ts-expect-error extended fields
      address: profile.address || "",
      // @ts-expect-error extended fields
      bio: profile.bio || "",
      // @ts-expect-error extended fields
      services: profile.services || [],
      // @ts-expect-error extended fields
      avatar_url: profile.avatar_url || "",
    }));
  }, [profile]);

  const upload = async (file: File) => {
    if (!user) return;
    setBusy(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { setBusy(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setF(s => ({ ...s, avatar_url: data.publicUrl }));
    setBusy(false);
    toast.success("Photo uploaded");
  };

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      first_name: f.first_name, last_name: f.last_name, phone: f.phone, city: f.city,
      trade: f.trade, address: f.address, bio: f.bio, services: f.services, avatar_url: f.avatar_url,
    }).eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    await refreshProfile();
  };

  const toggleService = (s: string) => {
    setF(prev => ({ ...prev, services: prev.services.includes(s) ? prev.services.filter(x => x !== s) : [...prev.services, s] }));
  };

  const isProvider = profile?.role === "provider";

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <h1 className="font-display text-2xl md:text-3xl font-extrabold text-navy mb-2">My Profile</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {isProvider ? "This card is public so customers can find and book you." : "Update your personal details."}
      </p>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 ring-2 ring-gold/20">
            {f.avatar_url ? <AvatarImage src={f.avatar_url} /> : null}
            <AvatarFallback className="bg-navy text-white text-xl font-bold">
              {f.first_name[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-gold text-gold font-bold text-sm">
              <Camera className="w-4 h-4" /> {f.avatar_url ? "Change photo" : "Upload photo"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><Label>First Name *</Label><Input value={f.first_name} onChange={e => setF({...f, first_name: e.target.value})} /></div>
          <div><Label>Last Name</Label><Input value={f.last_name} onChange={e => setF({...f, last_name: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Phone *</Label><Input value={f.phone} onChange={e => setF({...f, phone: e.target.value})} /></div>
          <div><Label>City</Label><Input value={f.city} onChange={e => setF({...f, city: e.target.value})} /></div>
        </div>
        <div><Label>Address</Label><Input value={f.address} onChange={e => setF({...f, address: e.target.value})} placeholder="Area, locality" /></div>

        {isProvider && (
          <>
            <div>
              <Label>Primary Trade</Label>
              <select className="w-full border border-input rounded-md h-10 px-3 bg-background"
                value={f.trade} onChange={e => setF({...f, trade: e.target.value})}>
                <option value="">Select your trade</option>
                {TRADES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Services you provide</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TRADES.map(s => (
                  <button key={s} type="button" onClick={() => toggleService(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                      f.services.includes(s) ? "border-gold bg-gold text-white" : "border-border text-muted-foreground"
                    }`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>About / Bio</Label>
              <Textarea value={f.bio} onChange={e => setF({...f, bio: e.target.value})} maxLength={300} placeholder="Years of experience, specialities, languages…" />
            </div>
          </>
        )}

        <Button onClick={save} disabled={busy} className="w-full bg-navy hover:bg-gold text-white font-bold">
          {busy ? "Saving…" : "Save Profile"}
        </Button>
      </Card>
    </div>
  );
}
