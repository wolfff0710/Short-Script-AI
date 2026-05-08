import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { consumeWhopOAuthState, getWhopRedirectUri } from "@/lib/whop";
import { toast } from "sonner";

export default function WhopCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"working" | "denied">("working");

  useEffect(() => {
    (async () => {
      try {
        const error = searchParams.get("error");
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        if (error) throw new Error(searchParams.get("error_description") || error);
        if (!code) throw new Error("No authorization code received");
        const codeVerifier = consumeWhopOAuthState(state);

        const { data, error: fnErr } = await supabase.functions.invoke("whop-auth", {
          body: { code, code_verifier: codeVerifier, redirect_uri: getWhopRedirectUri() },
        });

        if (fnErr) {
          // Try to read structured error from edge function
          const ctx: any = (fnErr as any).context;
          let body: any = null;
          try { body = await ctx?.json?.(); } catch {}
          if (body?.error === "no_access") {
            setStatus("denied");
            return;
          }
          throw new Error(body?.message || body?.error || fnErr.message);
        }

        if (!data?.token_hash || !data?.email) throw new Error("Invalid auth response");

        const { error: vErr } = await supabase.auth.verifyOtp({
          type: "magiclink",
          email: data.email,
          token_hash: data.token_hash,
        });
        if (vErr) throw vErr;

        toast.success("Signed in!");
        navigate("/generator");
      } catch (err) {
        console.error("Callback error:", err);
        toast.error(err instanceof Error ? err.message : "Authentication failed");
        navigate("/auth");
      }
    })();
  }, [searchParams, navigate]);

  if (status === "denied") {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gradient-card border border-border rounded-2xl p-8 shadow-card text-center">
          <h1 className="text-2xl font-bold mb-2">Purchase required</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your Whop account doesn’t have access to <strong>Short Script AI</strong>.
            Purchase the product on Whop, then sign in again.
          </p>
          <a
            href="https://whop.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full bg-primary text-primary-foreground rounded-md px-4 py-2 font-medium hover:opacity-90"
          >
            Get Short Script AI on Whop
          </a>
          <button
            onClick={() => (window.location.href = "/auth")}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Verifying your Whop access…</p>
      </div>
    </div>
  );
}
