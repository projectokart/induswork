import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — IndusWork" }, { name: "description", content: "Get in touch with IndusWork — call, WhatsApp or send us a message." }] }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(5).max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  service: z.string().max(100).optional(),
  message: z.string().trim().min(1).max(2000),
});

function Contact() {
  const [form, setForm] = useState({ name:"", phone:"", email:"", service:"", message:"" });
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name, phone: parsed.data.phone, email: parsed.data.email || null,
      service: parsed.data.service || null, message: parsed.data.message,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Message sent! We'll contact you within 2 hours."); setForm({name:"",phone:"",email:"",service:"",message:""}); }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-navy">Get in Touch</h1>
        <p className="mt-2 text-muted-foreground">We're here to help. Reach out anytime — our team responds within 2 hours.</p>
        <div className="mt-7 space-y-5">
          {[
            {i:"👤", l:"Owner", v:"Dev Sharma · Partner with Vivek Sharma"},
            {i:"📞", l:"Call / WhatsApp", v:"+91 86839 79659"},
            {i:"✉️", l:"Email", v:"support@induswork.in"},
            {i:"📍", l:"Registered Office", v:"3rd Floor, 44, Regal Building, 69, Connaught Cir, Hanuman Road Area, Connaught Place, New Delhi, Delhi 110001"},
            {i:"⏰", l:"Hours", v:"Mon–Sun · 7 AM – 10 PM"},
          ].map(c=>(
            <div key={c.l} className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center text-xl">{c.i}</div>
              <div><div className="text-xs text-muted-foreground font-semibold">{c.l}</div><div className="font-bold text-navy">{c.v}</div></div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={submit} className="bg-card rounded-xl p-7 border border-border shadow-soft space-y-4">
        <h3 className="font-display font-bold text-navy text-lg">Send us a message</h3>
        <div><Label>Full Name *</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Phone *</Label><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
        </div>
        <div><Label>Service</Label><Input placeholder="e.g. Plumbing" value={form.service} onChange={e=>setForm({...form,service:e.target.value})} /></div>
        <div><Label>Message *</Label><Textarea rows={4} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} /></div>
        <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-gold text-white font-bold">{loading?"Sending...":"Send Message"}</Button>
      </form>
    </div>
  );
}
