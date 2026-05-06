import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function WhopCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          throw new Error(errorDescription || error);
        }

        if (!code) {
          throw new Error("No authorization code received");
        }

        // Exchange code for token via backend
        const response = await fetch("/api/auth/callback/whop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Token exchange failed");
        }

        const data = await response.json();

        // Create session in Supabase with Whop user data
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.accessToken,
          refresh_token: data.refreshToken || "",
        });

        if (sessionError) {
          throw sessionError;
        }

        toast.success("Successfully signed in with Whop!");
        navigate("/generator");
      } catch (err) {
        console.error("Callback error:", err);
        toast.error(err instanceof Error ? err.message : "Authentication failed");
        setProcessing(false);
        navigate("/auth");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {processing ? "Signing you in..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}
