import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

export async function GET() {
  const clientId = process.env.GSC_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GSC_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GSC_OAUTH_REDIRECT_URI || "http://localhost:3002/api/gsc/oauth/callback";
  if (!clientId || !clientSecret) {
    return new Response(JSON.stringify({ error: "GSC OAuth client not configured" }), { status: 400 });
  }

  const oauth2 = new google.auth.OAuth2({ clientId, clientSecret, redirectUri });
  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
  return Response.json({ url });
}