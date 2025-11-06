import { getGA4TopPages } from "@/lib/google/ga4";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { getClientIp, requireAdminApiKey } from "@/lib/api/auth";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`ga4-top-pages:${ip}`, 60);
  if (rl) return rl;

  const unauthorized = requireAdminApiKey(req);
  if (unauthorized) return unauthorized;

  const url = new URL(req.url);
  const propertyId = url.searchParams.get("propertyId") || process.env.GA4_PROPERTY_ID || "";
  const startDate = url.searchParams.get("startDate") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = url.searchParams.get("endDate") || new Date().toISOString().slice(0, 10);
  const limit = Number(url.searchParams.get("limit") || 10);

  try {
    const data = await getGA4TopPages(propertyId, startDate, endDate, limit);
    return Response.json({ pages: data });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "GA4 error" }), { status: 500 });
  }
}