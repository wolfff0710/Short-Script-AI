// Whop OAuth integration
const WHOP_CLIENT_ID = import.meta.env.VITE_WHOP_CLIENT_ID;
const WHOP_AUTHORIZE_URL = 'https://whop.com/oauth';

export function getWhopRedirectUri() {
  return `${window.location.origin}/api/auth/callback/whop`;
}

export function getWhopAuthUrl() {
  const params = new URLSearchParams({
    client_id: WHOP_CLIENT_ID,
    redirect_uri: getWhopRedirectUri(),
    response_type: 'code',
    scope: 'openid offline_access',
  });
  return `${WHOP_AUTHORIZE_URL}?${params.toString()}`;
}

export function initiateWhopLogin() {
  if (!WHOP_CLIENT_ID) {
    throw new Error('Whop is not configured. Add VITE_WHOP_CLIENT_ID.');
  }
  window.location.href = getWhopAuthUrl();
}
