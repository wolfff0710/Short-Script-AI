import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Music, Type, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Row = {
  id: string; niche: string; platform: string; tone: string; length: number;
  created_at: string;
  content: { hook: string; body: string; cta: string; overlays: string[]; music: string }[];
};

const ALL = "all";

export default function History() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState(ALL);
  const [platform, setPlatform] = useState(ALL);
  const [tone, setTone] = useState(ALL);
  const [length, setLength] = useState(ALL);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("scripts").select("*").order("created_at", { ascending: false });
      setRows((data ?? []) as any);
    })();
  }, [user]);

  const uniq = (key: keyof Row) =>
    Array.from(new Set(rows.map((r) => String(r[key])))).sort();

  const niches = useMemo(() => uniq("niche"), [rows]);
  const platforms = useMemo(() => uniq("platform"), [rows]);
  const tones = useMemo(() => uniq("tone"), [rows]);
  const lengths = useMemo(() => uniq("length"), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (niche !== ALL && r.niche !== niche) return false;
      if (platform !== ALL && r.platform !== platform) return false;
      if (tone !== ALL && r.tone !== tone) return false;
      if (length !== ALL && String(r.length) !== length) return false;
      if (!q) return true;
      const hay = [
        r.niche, r.platform, r.tone,
        ...r.content.flatMap((s) => [s.hook, s.body, s.cta, s.music, ...(s.overlays ?? [])]),
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, niche, platform, tone, length]);

  const hasFilters = search || niche !== ALL || platform !== ALL || tone !== ALL || length !== ALL;
  const clearAll = () => { setSearch(""); setNiche(ALL); setPlatform(ALL); setTone(ALL); setLength(ALL); };

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10 max-w-5xl">
        <h1 className="text-3xl font-bold mb-2">Script <span className="text-gradient">History</span></h1>
        <p className="text-muted-foreground mb-6">All your saved generations.</p>

        <div className="bg-gradient-card border border-border rounded-2xl p-4 mb-6 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search hooks, body, CTAs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <FilterSelect label="Niche" value={niche} onChange={setNiche} options={niches} />
            <FilterSelect label="Platform" value={platform} onChange={setPlatform} options={platforms} />
            <FilterSelect label="Tone" value={tone} onChange={setTone} options={tones} />
            <FilterSelect label="Length" value={length} onChange={setLength} options={lengths} suffix="s" />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{filtered.length} of {rows.length} script set{rows.length === 1 ? "" : "s"}</span>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 px-2">
                <X className="w-3 h-3 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        {rows.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No scripts saved yet — generate some!</p>
        )}
        {rows.length > 0 && filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No scripts match your filters.</p>
        )}

        <div className="space-y-6">
          {filtered.map((r) => (
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

function FilterSelect({
  label, value, onChange, options, suffix = "",
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; suffix?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All {label.toLowerCase()}s</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}{suffix}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
