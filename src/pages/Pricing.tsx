import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const plans = [
  {
    name: "Free", price: "$0", per: "forever",
    features: ["3 scripts per day", "All platforms & tones", "Copy to clipboard", "Hooks, CTAs, overlays, music"],
    cta: "Start Free", variant: "outline" as const, link: "/auth",
  },
  {
    name: "Pro", price: "$19", per: "/month", featured: true,
    features: ["Unlimited scripts", "Save script history", "Regenerate anytime", "Priority generation", "Early access to new features"],
    cta: "Upgrade to Pro", variant: "hero" as const,
  },
];

export default function Pricing() {
  const { user } = useAuth();

  const upgrade = async () => {
    if (!user) { window.location.href = "/auth"; return; }
    const { data, error } = await supabase.functions.invoke("create-checkout");
    if (error || !data?.url) { toast.error("Checkout unavailable. Connect Stripe to enable Pro."); return; }
    window.open(data.url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container py-20 max-w-5xl">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Simple, <span className="text-gradient">creator-friendly</span> pricing</h1>
          <p className="text-muted-foreground">Start free. Upgrade when you're shipping daily.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-2xl p-8 shadow-card border ${p.featured ? "border-primary bg-gradient-card shadow-glow" : "border-border bg-card"}`}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{p.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-muted-foreground"> {p.per}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              {p.link ? (
                <Link to={p.link}><Button variant={p.variant} className="w-full">{p.cta}</Button></Link>
              ) : (
                <Button variant={p.variant} className="w-full" onClick={upgrade}>{p.cta}</Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
