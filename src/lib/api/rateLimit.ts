const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limitPerMinute = 60) {
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, resetAt: now + 60_000 };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + 60_000;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  const remaining = Math.max(0, limitPerMinute - bucket.count);
  if (bucket.count > limitPerMinute) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: {
        "content-type": "application/json",
        "x-ratelimit-remaining": String(remaining),
      },
    });
  }
  return undefined;
}