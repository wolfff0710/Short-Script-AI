import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { niche, platform, tone, length } = body ?? {};
    if (!niche || !platform || !tone || !length) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Plan + usage check
    const { data: profile } = await admin
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();
    const plan = profile?.plan ?? "free";
    const today = new Date().toISOString().slice(0, 10);

    if (plan !== "pro") {
      const { data: usage } = await admin
        .from("daily_usage")
        .select("count")
        .eq("user_id", user.id)
        .eq("day", today)
        .maybeSingle();
      if ((usage?.count ?? 0) >= 3) {
        return new Response(
          JSON.stringify({ error: "Daily free limit reached. Upgrade to Pro for unlimited scripts." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `You are an elite short-form video script writer for faceless content creators. You produce viral, scroll-stopping scripts for TikTok, YouTube Shorts, and Instagram Reels.`;
    const userPrompt = `Generate 5 unique, high-performing short-form video scripts.

Niche: ${niche}
Platform: ${platform}
Tone: ${tone}
Target length: ${length} seconds

Each script must include:
- hook (first 3 seconds, scroll-stopping)
- body (main content, pacing matched to ${length}s)
- cta (clear call-to-action at the end)
- overlays (3-6 short on-screen text overlays)
- music (suggested background music mood)

Make each of the 5 scripts genuinely different in angle.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_scripts",
            description: "Return 5 short-form video scripts",
            parameters: {
              type: "object",
              properties: {
                scripts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      hook: { type: "string" },
                      body: { type: "string" },
                      cta: { type: "string" },
                      overlays: { type: "array", items: { type: "string" } },
                      music: { type: "string" },
                    },
                    required: ["hook", "body", "cta", "overlays", "music"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["scripts"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_scripts" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway failed");
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : null;
    const scripts = args?.scripts ?? [];

    // Increment usage (free users)
    if (plan !== "pro") {
      const { data: existing } = await admin
        .from("daily_usage")
        .select("count")
        .eq("user_id", user.id)
        .eq("day", today)
        .maybeSingle();
      if (existing) {
        await admin.from("daily_usage")
          .update({ count: existing.count + 1 })
          .eq("user_id", user.id).eq("day", today);
      } else {
        await admin.from("daily_usage").insert({ user_id: user.id, day: today, count: 1 });
      }
    }

    // Save to history (Pro only)
    if (plan === "pro") {
      await admin.from("scripts").insert({
        user_id: user.id, niche, platform, tone, length,
        content: scripts,
      });
    }

    return new Response(JSON.stringify({ scripts, plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-scripts error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
