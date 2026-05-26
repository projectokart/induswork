import { Link } from "@tanstack/react-router";
import { Home, Wrench, Radio, PlusCircle, User } from "lucide-react";

const tabs: { to: string; label: string; Icon: typeof Home; exact?: boolean }[] = [
  { to: "/", label: "Home", Icon: Home, exact: true },
  { to: "/services", label: "Services", Icon: Wrench },
  { to: "/requirements", label: "Demand", Icon: Radio },
  { to: "/post-requirement", label: "Post", Icon: PlusCircle },
  { to: "/providers", label: "Pros", Icon: User },
];

export function BottomTabBar() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-elevate"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, label, Icon, exact }) => (
          <li key={to}>
            <Link
              to={to as "/"}
              activeOptions={{ exact: !!exact }}
              className="flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-bold text-muted-foreground"
              activeProps={{ className: "flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-bold text-gold" }}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
