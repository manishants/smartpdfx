import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export function unauthorized(message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

// Supabase-only guard: require an authenticated SUPERADMIN user
export async function requireSuperadmin(): Promise<Response | undefined> {
  try {
    const isSupabaseDisabled =
      process.env.NEXT_PUBLIC_DISABLE_SUPABASE === "true" ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (isSupabaseDisabled) {
      const cookieStore = cookies();
      const role = cookieStore.get("spx_admin")?.value;
      if (role === "superadmin") return undefined;
      return unauthorized();
    }

    const supabase = createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return unauthorized();

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "superadmin") {
      return unauthorized();
    }
    return undefined;
  } catch {
    return unauthorized();
  }
}

export function getClientIp(req: Request) {
  const xfwd = req.headers.get("x-forwarded-for") || "";
  const ip = xfwd.split(",")[0]?.trim();
  return ip || "127.0.0.1";
}