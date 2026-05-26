import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function QuoteDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", address: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = f.name.trim();
    const phone = f.phone.trim();
    const address = f.address.trim();
    const message = f.message.trim();
    if (name.length < 2) return toast.error("Please enter your name");
    if (!/^[0-9+\s-]{7,20}$/.test(phone)) return toast.error("Please enter a valid phone number");
    if (address.length < 5) return toast.error("Please enter your address");
    const body = `Address: ${address}\nRequirement: ${message || "(not provided)"}`;
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({
      name, phone, message: body, service: "Quote request",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setDone(true);
    setTimeout(() => {
      setOpen(false);
      setTimeout(() => { setDone(false); setF({ name:"", phone:"", address:"", message:"" }); }, 300);
    }, 2200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {done ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-14 h-14 text-gold mx-auto mb-3" />
            <h3 className="font-display font-extrabold text-xl text-navy">Thank you!</h3>
            <p className="text-sm text-muted-foreground mt-2">We at IndusWork will contact you shortly.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-navy">Request a Free Quote</DialogTitle>
              <DialogDescription>Tell us what you need. Our team will call you within 30 minutes.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label htmlFor="q-name">Name *</Label>
                <Input id="q-name" maxLength={100} value={f.name} onChange={e=>setF({...f, name:e.target.value})} required />
              </div>
              <div>
                <Label htmlFor="q-phone">Phone *</Label>
                <Input id="q-phone" type="tel" maxLength={20} value={f.phone} onChange={e=>setF({...f, phone:e.target.value})} placeholder="e.g. 9876543210" required />
              </div>
              <div>
                <Label htmlFor="q-addr">Address *</Label>
                <Input id="q-addr" maxLength={250} value={f.address} onChange={e=>setF({...f, address:e.target.value})} placeholder="House / street / city" required />
              </div>
              <div>
                <Label htmlFor="q-msg">Your requirement</Label>
                <Textarea id="q-msg" rows={3} maxLength={1500} value={f.message} onChange={e=>setF({...f, message:e.target.value})} placeholder="e.g. Need an electrician for fan installation" />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-gold hover:bg-gold-deep text-white font-extrabold">
                {busy ? "Sending…" : "Send Request"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
