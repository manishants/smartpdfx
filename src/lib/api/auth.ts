// Supabase has been removed. Auth guard becomes a no-op to allow access.

export function unauthorized(message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

// No-op guard: allow all requests during local-only phase
export async function requireSuperadmin(): Promise<Response | undefined> {
  return undefined;
}

export function getClientIp(req: Request) {
  const xfwd = req.headers.get("x-forwarded-for") || "";
  const ip = xfwd.split(",")[0]?.trim();
  return ip || "127.0.0.1";
}