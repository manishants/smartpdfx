import { google } from "googleapis";
import { requireSuperadmin } from "@/lib/api/auth";

export async function GET(req: Request) {
  const unauthorized = await requireSuperadmin();
  if (unauthorized) return unauthorized;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const clientId = process.env.GSC_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GSC_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GSC_OAUTH_REDIRECT_URI || "http://localhost:3002/api/gsc/oauth/callback";

  if (!clientId || !clientSecret) {
    return new Response("GSC OAuth client not configured", { status: 400 });
  }
  if (!code) {
    return new Response("Missing OAuth code", { status: 400 });
  }

  const oauth2 = new google.auth.OAuth2({ clientId, clientSecret, redirectUri });
  try {
    const { tokens } = await oauth2.getToken(code);
    const refresh = tokens.refresh_token;
    const access = tokens.access_token;

    const bodyHtml = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>GSC OAuth Complete</title>
          <style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;line-height:1.6}</style>
        </head>
        <body>
          <h1>Search Console OAuth Complete</h1>
          ${refresh ? `<p><strong>Refresh Token:</strong></p><pre>${refresh}</pre>` : `<p><strong>No refresh token returned.</strong> Try again and ensure <code>access_type=offline</code> and <code>prompt=consent</code> are set.</p>`}
          ${access ? `<p><em>Access token received (short-lived)</em></p>` : ""}
          <p>Next steps:</p>
          <ol>
            <li>Copy the refresh token above.</li>
            <li>Paste it into your <code>.env.local</code> as <code>GSC_REFRESH_TOKEN</code>.</li>
            <li>Restart the dev server.</li>
            <li>Open Superadmin → Analytics → Credentials and click "Test Credentials".</li>
          </ol>
        </body>
      </html>`;

    return new Response(bodyHtml, { status: 200, headers: { "content-type": "text/html" } });
  } catch (e: any) {
    const message = e?.message || "Failed to exchange OAuth code";
    return new Response(message, { status: 500 });
  }
}