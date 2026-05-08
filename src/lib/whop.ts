// Whop OAuth integration
import { supabase } from "@/integrations/supabase/client";

const WHOP_AUTHORIZE_URL = "https://api.whop.com/oauth/authorize";
const WHOP_OAUTH_STORAGE_KEY = "whop_oauth_pkce";

function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, (char) => {
    if (char === "+") return "-";
    if (char === "/") return "_";
    return "";
  });
}

function randomString(length: number) {
  return base64Url(crypto.getRandomValues(new Uint8Array(length)));
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return base64Url(new Uint8Array(digest));
}

export function getWhopRedirectUri() {
  return `${window.location.origin}/api/auth/callback/whop`;
}

export function consumeWhopOAuthState(returnedState: string | null) {
  const stored = sessionStorage.getItem(WHOP_OAUTH_STORAGE_KEY);
  sessionStorage.removeItem(WHOP_OAUTH_STORAGE_KEY);

  if (!stored) throw new Error("Whop login expired. Please try again.");

  const parsed = JSON.parse(stored) as { codeVerifier?: string; state?: string };
  if (!parsed.state || !returnedState || parsed.state !== returnedState) {
    throw new Error("Invalid Whop login session. Please try again.");
  }

  if (!parsed.codeVerifier) throw new Error("Whop login verifier missing. Please try again.");
  return parsed.codeVerifier;
}

export async function initiateWhopLogin() {
  const { data, error } = await supabase.functions.invoke("whop-auth", {
    body: { action: "config" },
  });
  if (error || !data?.client_id) {
    throw new Error("Whop is not configured. Please contact support.");
  }

  const codeVerifier = randomString(32);
  const state = randomString(16);
  const nonce = randomString(16);
  sessionStorage.setItem(WHOP_OAUTH_STORAGE_KEY, JSON.stringify({ codeVerifier, state }));

  const params = new URLSearchParams({
    client_id: data.client_id,
    redirect_uri: getWhopRedirectUri(),
    response_type: "code",
    scope: "openid profile email",
    state,
    nonce,
    code_challenge: await sha256(codeVerifier),
    code_challenge_method: "S256",
  });
  window.location.href = `${WHOP_AUTHORIZE_URL}?${params.toString()}`;
}
