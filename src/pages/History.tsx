import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Music, Type } from "lucide-react";

type Row = {
  id: string; niche: string; platform: string; tone: string; length: number;
  created_at: string;
  content: { hook: string; body: string; cta: string; overlays: string[]; music: string }[];
};

export default function History() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("scripts").select("*").order("created_at", { ascending: false });
      setRows((data ?? []) as any);
    })();
  }, [user]);

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10 max-w-5xl">
        <h1 className="text-3xl font-bold mb-2">Script <span className="text-gradient">History</span></h1>
        <p className="text-muted-foreground mb-8">All your saved generations.</p>

        {rows.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No scripts saved yet — generate some!</p>
        )}

        <div className="space-y-6">
          {rows.map((r) => (
            <div key={r.id} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex flex-wrap gap-2 text-xs mb-4">
                <span className="px-2 py-1 rounded bg-primary/10 text-primary">{r.niche}</span>
                <span className="px-2 py-1 rounded bg-secondary">{r.platform}</span>
                <span className="px-2 py-1 rounded bg-secondary">{r.tone}</span>
                <span className="px-2 py-1 rounded bg-secondary">{r.length}s</span>
                <span className="ml-auto text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <div className="grid gap-3">
                {r.content.map((s, i) => (
                  <details key={i} className="border border-border rounded-lg p-3">
                    <summary className="cursor-pointer text-sm font-semibold">Script {i + 1}: {s.hook}</summary>
                    <div className="mt-3 space-y-2 text-sm">
                      <p><b>Body:</b> {s.body}</p>
                      <p><b>CTA:</b> {s.cta}</p>
                      <p className="flex gap-1 items-center"><Type className="w-3 h-3" /> {s.overlays.join(" • ")}</p>
                      <p className="flex gap-1 items-center"><Music className="w-3 h-3" /> {s.music}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
