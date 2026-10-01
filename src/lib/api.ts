import type { StoryInput } from "@/lib/story-service";

const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(request: Request, limit = 30) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${ip}:${new URL(request.url).pathname}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) { buckets.set(key, { count: 1, reset: now + 60_000 }); return true; }
  bucket.count++;
  if (buckets.size > 2000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  return bucket.count <= limit;
}

export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  return new URL(origin).host === host || origin === process.env.APP_ORIGIN;
}

export function corsOptions(request: Request) {
  if (!isAllowedOrigin(request)) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": request.headers.get("origin") || "", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}

export function rejectRequest(request: Request, limit = 30): Response | null {
  if (!isAllowedOrigin(request)) return Response.json({ success: false, error: "Origin not allowed" }, { status: 403 });
  if (!rateLimit(request, limit)) return Response.json({ success: false, error: "Too many requests. Please wait a moment." }, { status: 429 });
  return null;
}
export function errorResponse(error: unknown) {
  console.error("StoryVerse API error:", error);
  return Response.json({ success: false, error: "Something went wrong while generating your story. Please try again." }, { status: 500 });
}
export function validId(id: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id); }
const genres = ["Fantasy", "Adventure", "Sci-Fi", "Mystery", "Romance", "Comedy", "Drama"];
const lengths = ["Short", "Medium", "Long"];
const ages = ["Everyone", "Kids", "Teens", "Adults"];
const styles = ["Cinematic", "Pixar-inspired", "Anime", "Watercolor", "Stop Motion"];
export function parseStoryInput(body: unknown): StoryInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.idea !== "string" || b.idea.trim().length < 10 || b.idea.length > 2000 || !genres.includes(String(b.genre)) || !lengths.includes(String(b.length)) || !ages.includes(String(b.ageGroup)) || !styles.includes(String(b.animationStyle))) return null;
  return { idea: b.idea.trim(), genre: String(b.genre), length: String(b.length), ageGroup: String(b.ageGroup), animationStyle: String(b.animationStyle) };
}
export function invalidInput() { return Response.json({ success: false, error: "Please enter an idea of at least 10 characters and select valid story options." }, { status: 400 }); }
