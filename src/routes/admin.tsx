import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — IndusWork" }] }),
  component: Admin,
});

type Msg = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  message: string;
  status: string;
  created_at: string;
};

function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "resolved">("all");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      const admin = (data ?? []).some(r => r.role === "admin");
      setIsAdmin(admin);
      if (!admin) { toast.error("Admin access required"); navigate({ to: "/dashboard" }); }
    });
  }, [user, navigate]);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setMsgs((data ?? []) as Msg[]);
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const setStatus = async (m: Msg, status: string) => {
    setBusy(m.id);
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", m.id);
    setBusy(null);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };

  const remove = async (m: Msg) => {
    if (!confirm(`Delete message from ${m.name}?`)) return;
    setBusy(m.id);
    const { error } = await supabase.from("contact_messages").delete().eq("id", m.id);
    setBusy(null);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  if (!user || isAdmin !== true) return null;

  const visible = msgs.filter(m => filter === "all" || m.status === filter);
  const counts = {
    all: msgs.length,
    new: msgs.filter(m => m.status === "new").length,
    read: msgs.filter(m => m.status === "read").length,
    resolved: msgs.filter(m => m.status === "resolved").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="gradient-hero rounded-2xl p-7 text-white mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">Admin · Contact Messages</h1>
          <p className="text-sm opacity-80 mt-1">Review and manage incoming customer messages.</p>
        </div>
        <Link to="/admin/analytics" className="bg-white text-navy font-extrabold text-xs px-4 py-2 rounded-full">📊 Analytics Dashboard →</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {(["all","new","read","resolved"] as const).map(k => (
          <button key={k} onClick={() => setFilter(k)}
            className={`text-xs font-bold px-4 py-2 rounded-full border transition ${filter===k ? "bg-navy text-white border-navy" : "bg-card text-muted-foreground border-border hover:border-gold"}`}>
            {k.toUpperCase()} · {counts[k]}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No messages.</p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map(m => (
              <li key={m.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-navy">{m.name}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        m.status==="new" ? "bg-amber-100 text-amber-700" :
                        m.status==="read" ? "bg-blue-100 text-blue-700" :
                                            "bg-accent text-gold"
                      }`}>{m.status}</span>
                      {m.service && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{m.service}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      📞 {m.phone}{m.email ? ` · ✉️ ${m.email}` : ""} · {new Date(m.created_at).toLocaleString("en-IN")}
                    </div>
                    <p className="text-sm text-foreground mt-3 whitespace-pre-wrap">{m.message}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {m.status !== "read" && (
                      <Button size="sm" variant="outline" disabled={busy===m.id} onClick={() => setStatus(m, "read")}>Mark read</Button>
                    )}
                    {m.status !== "resolved" && (
                      <Button size="sm" disabled={busy===m.id} onClick={() => setStatus(m, "resolved")} className="bg-gold hover:bg-gold-deep text-white">Resolve</Button>
                    )}
                    <Button size="sm" variant="outline" disabled={busy===m.id} onClick={() => remove(m)} className="border-red-300 text-red-600 hover:bg-red-50">Delete</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
