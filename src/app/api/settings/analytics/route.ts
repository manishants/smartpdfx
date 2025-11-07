import { readAnalyticsConfig, writeAnalyticsConfig } from "@/lib/analyticsConfigStore";
import { getClientIp, requireSuperadmin } from "@/lib/api/auth";
import { checkRateLimit } from "@/lib/api/rateLimit";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`settings-analytics-get:${ip}`, 120);
  if (rl) return rl;
  const cfg = readAnalyticsConfig();
  const unauthorized = await requireSuperadmin();
  if (unauthorized) return unauthorized;
  return Response.json({ config: cfg });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`settings-analytics-post:${ip}`, 30);
  if (rl) return rl;

  const unauthorized = await requireSuperadmin();
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