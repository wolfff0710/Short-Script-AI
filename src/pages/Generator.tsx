import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, RefreshCw, Loader2, Sparkles, Music, Type } from "lucide-react";

type Script = {
  hook: string; body: string; cta: string;
  overlays: string[]; music: string;
};

export default function Generator() {
  const { user, loading } = useAuth();
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [tone, setTone] = useState("motivational");
  const [length, setLength] = useState("30");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [generating, setGenerating] = useState(false);

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/auth" replace />;

  const generate = async () => {
    if (!niche.trim()) { toast.error("Enter a niche/topic"); return; }
    setGenerating(true);
    setScripts([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-scripts", {
        body: { niche, platform, tone, length: Number(length) },
      });
      if (error) {
        const msg = (error as any)?.context?.error ?? error.message;
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      setScripts(data.scripts ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const copyScript = (s: Script, i: number) => {
    const text = `HOOK:\n${s.hook}\n\nBODY:\n${s.body}\n\nCTA:\n${s.cta}\n\nOVERLAYS:\n${s.overlays.map(o => `• ${o}`).join("\n")}\n\nMUSIC: ${s.music}`;
    navigator.clipboard.writeText(text);
    toast.success(`Script ${i + 1} copied`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Script <span className="text-gradient">Generator</span></h1>
          <p className="text-muted-foreground">Configure your video and generate 5 unique scripts.</p>
        </div>

        <div className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Niche / Topic</Label>
              <Input placeholder="e.g. dark facts, gym motivation, finance tips" value={niche} onChange={(e) => setNiche(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="YouTube Shorts">YouTube Shorts</SelectItem>
                  <SelectItem value="Instagram Reels">Instagram Reels</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="motivational">Motivational</SelectItem>
                  <SelectItem value="mysterious">Mysterious</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="funny">Funny</SelectItem>
                  <SelectItem value="dramatic">Dramatic</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="45">45 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button variant="hero" size="lg" className="w-full" onClick={generate} disabled={generating}>
            {generating ? <><Loader2 className="animate-spin" /> Generating 5 scripts...</> : <><Sparkles /> Generate 5 Scripts</>}
          </Button>
        </div>

        {scripts.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your scripts</h2>
            <Button variant="outline" size="sm" onClick={generate} disabled={generating}>
              <RefreshCw className="w-3 h-3" /> Regenerate
            </Button>
          </div>
        )}

        <div className="grid gap-4">
          {scripts.map((s, i) => (
            <article key={i} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex justify-between items-start mb-4">
                <div className="text-xs uppercase tracking-wider text-primary font-semibold">Script {i + 1}</div>
                <Button variant="ghost" size="sm" onClick={() => copyScript(s, i)}><Copy className="w-3 h-3" /> Copy</Button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Hook (0-3s)</div>
                  <p className="text-base font-medium">{s.hook}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Body</div>
                  <p className="text-sm whitespace-pre-line text-foreground/90">{s.body}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">CTA</div>
                  <p className="text-sm">{s.cta}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Type className="w-3 h-3" /> On-screen overlays</div>
                    <ul className="text-sm space-y-1">
                      {s.overlays.map((o, j) => <li key={j} className="text-foreground/80">• {o}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Music className="w-3 h-3" /> Music mood</div>
                    <p className="text-sm text-foreground/80">{s.music}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
