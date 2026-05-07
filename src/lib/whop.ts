// Whop OAuth integration
import { supabase } from "@/integrations/supabase/client";

const WHOP_AUTHORIZE_URL = "https://whop.com/oauth";

export function getWhopRedirectUri() {
  return `${window.location.origin}/api/auth/callback/whop`;
}

export async function initiateWhopLogin() {
  const { data, error } = await supabase.functions.invoke("whop-auth", {
    body: { action: "config" },
  });
  if (error || !data?.client_id) {
    throw new Error("Whop is not configured. Please contact support.");
  }
const params = new URLSearchParams({
  client_id: data.client_id,
  redirect_uri: getWhopRedirectUri(),
  response_type: "code",
  scope: "openid user",   // ← was "openid offline_access"
});
  window.location.href = `${WHOP_AUTHORIZE_URL}?${params.toString()}`;
}
