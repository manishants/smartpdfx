import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

const required = (name: string, value?: string) => {
  if (!value) throw new Error(`${name} is not set`);
  return value;
};

async function getAuth() {
  const method = process.env.GSC_AUTH_METHOD || "oauth"; // "service" or "oauth"
  if (method === "service") {
    const clientEmail = required("GOOGLE_SERVICE_ACCOUNT_EMAIL", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    const privateKey = required("GOOGLE_SERVICE_ACCOUNT_KEY", process.env.GOOGLE_SERVICE_ACCOUNT_KEY)?.replace(/\\n/g, "\n");
    const jwt = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: SCOPES,
    });
    return jwt;
  }

  const clientId = required("GSC_OAUTH_CLIENT_ID", process.env.GSC_OAUTH_CLIENT_ID);
  const clientSecret = required("GSC_OAUTH_CLIENT_SECRET", process.env.GSC_OAUTH_CLIENT_SECRET);
  const redirectUri = process.env.GSC_OAUTH_REDIRECT_URI || "http://localhost:3000/api/gsc/oauth/callback";
  const refreshToken = required("GSC_REFRESH_TOKEN", process.env.GSC_REFRESH_TOKEN);
  const oauth2 = new google.auth.OAuth2({ clientId, clientSecret, redirectUri });
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

async function getClient() {
  const auth = await getAuth();
  return google.webmasters({ version: "v3", auth });
}

export async function getGSCOverview(siteUrl: string, startDate: string, endDate: string) {
  const webmasters = await getClient();
  const { data } = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["date"],
      rowLimit: 1000,
    },
  });

  let clicks = 0;
  let impressions = 0;
  let ctr = 0;
  let position = 0;
  const series: { date: string; clicks: number; impressions: number; ctr: number; position: number }[] = [];

  (data.rows || []).forEach((row) => {
    const date = (row.keys || [""])[0];
    clicks += row.clicks || 0;
    impressions += row.impressions || 0;
    ctr += row.ctr || 0;
    position += row.position || 0;
    series.push({ date, clicks: row.clicks || 0, impressions: row.impressions || 0, ctr: row.ctr || 0, position: row.position || 0 });
  });

  const count = (data.rows || []).length || 1;
  return {
    totals: {
      clicks,
      impressions,
      ctr: Number((ctr / count).toFixed(4)),
      position: Number((position / count).toFixed(2)),
    },
    series,
  };
}

export async function getGSCTopPages(siteUrl: string, startDate: string, endDate: string, limit = 20) {
  const webmasters = await getClient();
  const { data } = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: 2500,
    },
  });
  const rows = (data.rows || [])
    .map((r) => ({ page: (r.keys || [""])[0], clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: r.ctr || 0, position: r.position || 0 }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit);
  return rows;
}

export async function getGSCKeywords(siteUrl: string, startDate: string, endDate: string, limit = 20) {
  const webmasters = await getClient();
  const { data } = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit: 2500,
    },
  });
  const rows = (data.rows || [])
    .map((r) => ({ query: (r.keys || [""])[0], clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: r.ctr || 0, position: r.position || 0 }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit);
  return rows;
}