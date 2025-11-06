export function unauthorized(message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

export function requireAdminApiKey(req: Request) {
  const requiredKey = process.env.SUPERADMIN_API_KEY;
  if (!requiredKey) return undefined; // allow if no key configured
  const headerKey = req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key");
  if (!headerKey || headerKey !== requiredKey) {
    return unauthorized();
  }
  return undefined;
}

export function getClientIp(req: Request) {
  const xfwd = req.headers.get("x-forwarded-for") || "";
  const ip = xfwd.split(",")[0]?.trim();
  return ip || "127.0.0.1";
}