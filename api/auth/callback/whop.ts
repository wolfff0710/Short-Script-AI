import type { VercelRequest, VercelResponse } from "@vercel/node";

const WHOP_TOKEN_URL = "https://api.whop.com/oauth/token";
const WHOP_CLIENT_ID = process.env.WHOP_CLIENT_ID;
const WHOP_CLIENT_SECRET = process.env.WHOP_CLIENT_SECRET;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    if (!WHOP_CLIENT_ID || !WHOP_CLIENT_SECRET) {
      console.error("Missing Whop credentials");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(WHOP_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: WHOP_CLIENT_ID,
        client_secret: WHOP_CLIENT_SECRET,
        redirect_uri: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.APP_URL || "http://localhost:5173"}/api/auth/callback/whop`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange error:", errorData);
      return res.status(400).json({
        error: errorData.error_description || "Token exchange failed",
      });
    }

    const tokenData = await tokenResponse.json();

    // Return tokens to client
    return res.status(200).json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresIn: tokenData.expires_in,
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
