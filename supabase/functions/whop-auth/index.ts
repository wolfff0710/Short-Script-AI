// Whop OAuth + membership gating
// Verifies the signed-in Whop user owns WHOP_PRODUCT_ID, then issues a Supabase magic-link token.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { code, redirect_uri } = await req.json();
    if (!code || !redirect_uri) return json({ error: "Missing code or redirect_uri" }, 400);

    const WHOP_CLIENT_ID = Deno.env.get("WHOP_CLIENT_ID");
    const WHOP_CLIENT_SECRET = Deno.env.get("WHOP_CLIENT_SECRET");
    const WHOP_PRODUCT_ID = Deno.env.get("WHOP_PRODUCT_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!WHOP_CLIENT_ID || !WHOP_CLIENT_SECRET || !WHOP_PRODUCT_ID) {
      return json({ error: "Server not configured" }, 500);
    }

    // 1. Exchange code for Whop access token
    const tokenRes = await fetch("https://api.whop.com/v5/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: WHOP_CLIENT_ID,
        client_secret: WHOP_CLIENT_SECRET,
        redirect_uri,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Whop token error:", tokenData);
      return json({ error: "whop_token_failed", detail: tokenData }, 400);
    }
    const accessToken = tokenData.access_token;

    // 2. Get Whop user
    const meRes = await fetch("https://api.whop.com/v5/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const me = await meRes.json();
    if (!meRes.ok) {
      console.error("Whop me error:", me);
      return json({ error: "whop_me_failed" }, 400);
    }
    const email: string | undefined = me.email;
    const username: string | undefined = me.username;
    if (!email) return json({ error: "no_email" }, 400);

    // 3. Verify membership for the product
    const memRes = await fetch(
      "https://api.whop.com/v5/me/memberships?per=50",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const memJson = await memRes.json();
    if (!memRes.ok) {
      console.error("Whop memberships error:", memJson);
      return json({ error: "whop_memberships_failed" }, 400);
    }
    const memberships: any[] = memJson.data ?? memJson ?? [];
    const hasAccess = memberships.some(
      (m) =>
        (m.product_id === WHOP_PRODUCT_ID ||
          m.product === WHOP_PRODUCT_ID ||
          m.access_pass_id === WHOP_PRODUCT_ID ||
          m.plan?.product_id === WHOP_PRODUCT_ID) &&
        (m.valid === true || m.status === "active" || m.status === "trialing")
    );

    if (!hasAccess) {
      return json({ error: "no_access", email, username }, 403);
    }

    // 4. Ensure Supabase user, then issue magic-link token
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try to find or create user
    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    let user = existing?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: username ?? "", whop_user_id: me.id },
      });
      if (cErr) {
        console.error("createUser error:", cErr);
        return json({ error: "create_user_failed" }, 500);
      }
      user = created.user!;
    }

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkErr || !linkData) {
      console.error("generateLink error:", linkErr);
      return json({ error: "magiclink_failed" }, 500);
    }
    const hashedToken = (linkData as any).properties?.hashed_token;
    if (!hashedToken) return json({ error: "no_token" }, 500);

    return json({ ok: true, email, token_hash: hashedToken });
  } catch (e) {
    console.error("whop-auth error:", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});
