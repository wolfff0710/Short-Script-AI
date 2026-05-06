import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Zap, History, Music, Type, Wand2 } from "lucide-react";

const features = [
  { icon: Wand2, title: "5 unique scripts per run", desc: "Different angles, hooks, and CTAs every time." },
  { icon: Zap, title: "Scroll-stopping hooks", desc: "Engineered for the first 3 seconds." },
  { icon: Type, title: "On-screen overlays", desc: "Auto-suggested text overlays per beat." },
  { icon: Music, title: "Music mood ideas", desc: "Soundtrack vibe matched to your script." },
  { icon: History, title: "Script History", desc: "Save every script and revisit anytime." },
  { icon: Sparkles, title: "TikTok / Reels / Shorts", desc: "Tuned to each platform's pacing." },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative bg-gradient-hero">
          <div className="container py-24 md:py-36 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur text-xs text-muted-foreground mb-8">
              <Sparkles className="w-3 h-3 text-primary" />
              AI scripts for faceless creators
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
              Viral short-form scripts in <span className="text-gradient">seconds</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Generate 5 platform-ready scripts with hooks, CTAs, on-screen overlays, and music suggestions — built for TikTok, Reels, and Shorts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth"><Button variant="hero" size="lg">Start Free →</Button></Link>
              <Link to="/pricing"><Button variant="outline" size="lg">See pricing</Button></Link>
            </div>
            <p className="text-xs text-muted-foreground mt-6">3 free scripts/day · No credit card required</p>
          </div>
        </section>

        {/* Features */}
        <section className="container py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything you need to <span className="text-gradient">go viral</span></h2>
            <p className="text-muted-foreground">Stop staring at a blank doc. Ship 10 videos a week.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card hover:border-primary/40 transition">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container pb-24">
          <div className="bg-gradient-card border border-border rounded-3xl p-12 text-center shadow-card">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to write your next viral script?</h2>
            <p className="text-muted-foreground mb-6">100% free. Unlimited scripts, every feature included.</p>
            <Link to="/auth"><Button variant="hero" size="lg">Start Free</Button></Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ShortScripts AI
      </footer>
    </div>
  );
};

export default Index;
