import { getGSCTopPages } from "@/lib/google/gsc";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { getClientIp, requireSuperadmin } from "@/lib/api/auth";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`gsc-top-pages:${ip}`, 60);
  if (rl) return rl;

  const unauthorized = await requireSuperadmin();
  if (unauthorized) return unauthorized;

  const url = new URL(req.url);
  const siteUrl = url.searchParams.get("siteUrl") || process.env.GSC_SITE_URL || "";
  const startDate = url.searchParams.get("startDate") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = url.searchParams.get("endDate") || new Date().toISOString().slice(0, 10);
  const limit = Number(url.searchParams.get("limit") || 20);

  try {
    const rows = await getGSCTopPages(siteUrl, startDate, endDate, limit);
    return Response.json({ pages: rows });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "GSC error" }), { status: 500 });
  }
}