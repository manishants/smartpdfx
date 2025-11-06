import { getGSCTopPages, getGSCKeywords, getGSCOverview } from "@/lib/google/gsc";
import { generateSuggestions } from "@/lib/seo/suggestions";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { getClientIp, requireAdminApiKey } from "@/lib/api/auth";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`seo-suggestions:${ip}`, 40);
  if (rl) return rl;

  const unauthorized = requireAdminApiKey(req);
  if (unauthorized) return unauthorized;

  const url = new URL(req.url);
  const siteUrl = url.searchParams.get("siteUrl") || process.env.GSC_SITE_URL || "";
  const startDate = url.searchParams.get("startDate") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = url.searchParams.get("endDate") || new Date().toISOString().slice(0, 10);

  try {
    const [pages, keywords, overview] = await Promise.all([
      getGSCTopPages(siteUrl, startDate, endDate, 50),
      getGSCKeywords(siteUrl, startDate, endDate, 50),
      getGSCOverview(siteUrl, startDate, endDate),
    ]);
    const suggestions = generateSuggestions({ pages, keywords, totals: overview.totals });
    return Response.json({ suggestions });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Suggestions error" }), { status: 500 });
  }
}