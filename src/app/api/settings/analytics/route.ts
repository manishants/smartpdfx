import { readAnalyticsConfig, writeAnalyticsConfig } from "@/lib/analyticsConfigStore";
import { getClientIp, requireAdminApiKey } from "@/lib/api/auth";
import { checkRateLimit } from "@/lib/api/rateLimit";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`settings-analytics-get:${ip}`, 120);
  if (rl) return rl;
  const cfg = readAnalyticsConfig();
  const requiresAdminKey = !!process.env.SUPERADMIN_API_KEY;
  return Response.json({ config: cfg, requiresAdminKey });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`settings-analytics-post:${ip}`, 30);
  if (rl) return rl;

  const unauthorized = requireAdminApiKey(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json().catch(() => ({}));
    const { ga4PropertyId, gscSiteUrl } = body || {};
    const next = writeAnalyticsConfig({
      ga4PropertyId: typeof ga4PropertyId === "string" ? ga4PropertyId.trim() : undefined,
      gscSiteUrl: typeof gscSiteUrl === "string" ? gscSiteUrl.trim() : undefined,
    });
    return Response.json({ config: next });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed to save config" }), { status: 500 });
  }
}