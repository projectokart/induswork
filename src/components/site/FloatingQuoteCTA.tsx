import { MessageSquarePlus } from "lucide-react";
import { QuoteDialog } from "./QuoteDialog";

export function FloatingQuoteCTA() {
  return (
    <div className="hidden md:block fixed bottom-5 right-5 z-40">
      <QuoteDialog
        trigger={
          <button className="flex items-center gap-2 bg-gold hover:bg-gold-deep text-white font-extrabold px-5 py-3 rounded-full shadow-elevate transition-transform hover:scale-105">
            <MessageSquarePlus className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Get Free Quote</span>
            <span className="sm:hidden text-sm">Quote</span>
          </button>
        }
      />
    </div>
  );
}
