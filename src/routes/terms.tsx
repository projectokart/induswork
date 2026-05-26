import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — IndusWork" }] }),
  component: () => (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display font-extrabold text-3xl text-navy">Terms & Conditions</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">Last updated: January 2025</p>
      {[
        ["1. Acceptance of Terms","By using IndusWork's platform, you agree to these Terms & Conditions."],
        ["2. Services Offered","IndusWork is a marketplace connecting customers with home service professionals."],
        ["3. User Responsibilities","Provide accurate information, ensure safe working conditions, pay as agreed."],
        ["4. Provider Responsibilities","Provide services as described, maintain professional conduct, arrive on time."],
        ["5. Pricing & Payments","All prices are transparent. UPI, card, or cash accepted."],
        ["6. Cancellation","2+ hrs before: full refund. Within 2 hrs: ₹50 fee. No-show: full charge."],
        ["7. Satisfaction Guarantee","Report within 24 hours for free redo or refund."],
        ["8. Limitation of Liability","IndusWork acts as a marketplace and is not directly liable beyond the guarantee policy."],
        ["9. Privacy","We collect minimum data and never sell it to third parties."],
        ["10. Contact","support@induswork.in | +91 98765 43210"],
      ].map(([h,b]) => (
        <div key={h} className="mb-6"><h2 className="font-display font-bold text-navy text-lg mb-2">{h}</h2><p className="text-sm text-muted-foreground leading-relaxed">{b}</p></div>
      ))}
    </div>
  ),
});
