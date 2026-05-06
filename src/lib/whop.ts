// Whop OAuth integration
const WHOP_CLIENT_ID = import.meta.env.VITE_WHOP_CLIENT_ID;
const WHOP_AUTHORIZE_URL = 'https://whop.com/oauth/authorize';

export function getWhopAuthUrl() {
  const redirectUri = `${window.location.origin}/api/auth/callback/whop`;
  
  const params = new URLSearchParams({
    client_id: WHOP_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'offline',
  });
  
  return `${WHOP_AUTHORIZE_URL}?${params.toString()}`;
}

export function initiateWhopLogin() {
  const authUrl = getWhopAuthUrl();
  window.location.href = authUrl;
}
