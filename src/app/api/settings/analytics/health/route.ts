import { getGA4Overview } from "@/lib/google/ga4";
import { getGSCOverview } from "@/lib/google/gsc";
import { readAnalyticsConfig } from "@/lib/analyticsConfigStore";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { getClientIp, requireAdminApiKey } from "@/lib/api/auth";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`analytics-health:${ip}`, 30);
  if (rl) return rl;

  const unauthorized = requireAdminApiKey(req);
  if (unauthorized) return unauthorized;

  const cfg = readAnalyticsConfig();
  const startDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = new Date().toISOString().slice(0, 10);

  const result: any = { ga4: { ok: false }, gsc: { ok: false } };

  try {
    if (!cfg.ga4PropertyId) throw new Error("GA4 Property ID not set");
    const ga = await getGA4Overview(cfg.ga4PropertyId, startDate, endDate);
    result.ga4 = { ok: true, totals: ga.totals };
  } catch (e: any) {
    result.ga4 = { ok: false, error: e?.message || "GA4 error" };
  }

  try {
    if (!cfg.gscSiteUrl) throw new Error("GSC Site URL not set");
    const gs = await getGSCOverview(cfg.gscSiteUrl, startDate, endDate);
    result.gsc = { ok: true, totals: gs.totals };
  } catch (e: any) {
    result.gsc = { ok: false, error: e?.message || "GSC error" };
  }

  return Response.json(result);
}