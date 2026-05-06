import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  "Unlimited script generation",
  "All platforms (TikTok, Reels, Shorts)",
  "Every tone & length option",
  "Hooks, CTAs, overlays & music suggestions",
  "Copy to clipboard",
  "Save full script history",
  "Regenerate anytime",
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container py-20 max-w-3xl">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Completely <span className="text-gradient">free</span> to use
          </h1>
          <p className="text-muted-foreground">
            One plan. Every feature. No credit card, no limits.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative rounded-2xl p-8 shadow-glow border border-primary bg-gradient-card">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
              FREE FOREVER
            </div>
            <h3 className="text-xl font-bold mb-1">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground"> forever</span>
            </div>
            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/auth">
              <Button variant="hero" className="w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
