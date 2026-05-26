import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

type N = { id: string; title: string; body: string | null; type: string; booking_id: string | null; link: string | null; read: boolean; created_at: string };

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<N[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(15);
      if (mounted && data) setItems(data as N[]);
    };
    load();
    const ch = supabase.channel(`notif-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (p) => setItems(prev => [p.new as N, ...prev].slice(0, 15)))
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [user]);

  if (!user) return null;
  const unread = items.filter(i => !i.read).length;

  const markAll = async () => {
    if (!unread) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setItems(prev => prev.map(i => ({ ...i, read: true })));
  };
  const markOne = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="relative p-2 rounded-full hover:bg-accent transition" aria-label="Notifications">
        <Bell className="w-5 h-5 text-navy" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-card border border-border rounded-xl shadow-elevate z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="font-bold text-navy text-sm">Notifications</div>
              {unread > 0 && (
                <button onClick={markAll} className="text-[11px] font-bold text-gold flex items-center gap-1 hover:underline">
                  <CheckCheck className="w-3 h-3" />Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet</div>
              ) : items.map(n => {
                const Content = (
                  <div className={`px-4 py-3 border-b border-border last:border-0 hover:bg-accent/40 transition ${!n.read ? "bg-accent/20" : ""}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg leading-none mt-0.5">{iconFor(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-navy text-sm">{n.title}</div>
                        {n.body && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>}
                        <div className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</div>
                      </div>
                      {!n.read && <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); markOne(n.id); }} className="text-gold shrink-0" aria-label="Mark read"><Check className="w-4 h-4" /></button>}
                    </div>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} to={n.link} onClick={() => { setOpen(false); if (!n.read) markOne(n.id); }} className="block">{Content}</Link>
                ) : <div key={n.id}>{Content}</div>;
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function iconFor(t: string) {
  switch (t) {
    case "booking_new": return "🆕";
    case "booking_accepted": return "✅";
    case "booking_rejected": return "❌";
    case "booking_completed": return "🎉";
    case "call": return "📞";
    default: return "🔔";
  }
}
