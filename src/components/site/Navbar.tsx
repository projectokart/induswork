import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/vaaskar-logo.png";
import { NotificationBell } from "@/components/site/NotificationBell";

export function Navbar() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/requirements", label: "Live Demand" },
    { to: "/post-requirement", label: "Post Req." },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 h-16 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70 border-b border-border/60 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={logo} alt="IndusWork — One fix for every Home" className="w-10 h-10 object-contain transition-transform group-hover:rotate-6" />
          <div className="font-display text-xl font-extrabold text-navy tracking-tight">
            Indus<span className="text-gradient-gold">Work</span>
          </div>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="relative px-3.5 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-navy transition-colors"
                activeProps={{ className: "relative px-3.5 py-2 rounded-lg text-sm font-bold text-navy after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <Button onClick={() => navigate({ to: "/dashboard" })} className="bg-navy hover:bg-navy-deep text-white">
                <UserIcon className="w-4 h-4" /> {profile?.first_name ?? "Account"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate({ to: "/login" })} className="border-2 border-navy text-navy font-bold">
                Login
              </Button>
              <Button onClick={() => navigate({ to: "/joinus" })} className="bg-gold hover:bg-gold-deep text-white font-bold">
                Join Us
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-1">
          {user && <NotificationBell />}
          <button className="p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-card border-b border-border shadow-elevate p-4 flex flex-col gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-3 py-3 rounded-lg font-bold text-foreground hover:bg-accent">
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            {user ? (
              <Button onClick={() => { setOpen(false); navigate({ to: "/dashboard" }); }} className="bg-navy text-white">Dashboard</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => { setOpen(false); navigate({ to: "/login" }); }}>Login</Button>
                <Button onClick={() => { setOpen(false); navigate({ to: "/joinus" }); }} className="bg-gold text-white">Join Us</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
