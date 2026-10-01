import { db } from "@/db";
import { stories, characters, scenes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStory } from "@/lib/story-repository";
import { corsOptions, errorResponse, rejectRequest, validId } from "@/lib/api";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export function OPTIONS(request: Request) { return corsOptions(request); }
export async function GET(request: Request, { params }: Context) {
  const rejected = rejectRequest(request, 90); if (rejected) return rejected;
  const { id } = await params; if (!validId(id)) return Response.json({ success: false, error: "Invalid story ID" }, { status: 400 });
  try { const story = await getStory(id); return story ? Response.json({ success: true, story }) : Response.json({ success: false, error: "Story not found" }, { status: 404 }); } catch (e) { return errorResponse(e); }
}
export async function PUT(request: Request, { params }: Context) {
  const rejected = rejectRequest(request, 40); if (rejected) return rejected;
  const { id } = await params; if (!validId(id)) return Response.json({ success: false, error: "Invalid story ID" }, { status: 400 });
  try {
    const current = await getStory(id); if (!current) return Response.json({ success: false, error: "Story not found" }, { status: 404 });
    const body = await request.json();
    if (!body || typeof body !== "object") return Response.json({ success: false, error: "Invalid request" }, { status: 400 });
    const fields: Record<string, string | Date> = { updatedAt: new Date() };
    for (const key of ["title", "logline", "idea"] as const) if (body[key] !== undefined) {
      if (typeof body[key] !== "string" || body[key].trim().length < 1 || body[key].length > 2000) return Response.json({ success: false, error: `Invalid ${key}` }, { status: 400 });
      fields[key] = body[key].trim();
    }
    if (body.characters !== undefined && (!Array.isArray(body.characters) || body.characters.length > 30)) return Response.json({ success: false, error: "Invalid characters" }, { status: 400 });
    if (body.scenes !== undefined && (!Array.isArray(body.scenes) || body.scenes.length > 50)) return Response.json({ success: false, error: "Invalid scenes" }, { status: 400 });
    await db.transaction(async tx => {
      await tx.update(stories).set(fields).where(eq(stories.id, id));
      if (Array.isArray(body.characters)) for (const c of body.characters) {
        if (typeof c.id !== "string" || !current.characters.some(item => item.id === c.id)) continue;
        const patch: Record<string, string | number | null> = {};
        for (const key of ["name", "role", "personality", "appearance", "objective"] as const) if (typeof c[key] === "string") patch[key] = c[key].slice(0, 2000);
        if (c.age === null || (Number.isInteger(c.age) && c.age >= 0 && c.age < 10000)) patch.age = c.age;
        if (Object.keys(patch).length) await tx.update(characters).set(patch).where(eq(characters.id, c.id));
      }
      if (Array.isArray(body.scenes)) for (const s of body.scenes) {
        if (typeof s.id !== "string" || !current.scenes.some(item => item.id === s.id)) continue;
        const patch: Record<string, string | string[]> = {};
        for (const key of ["title", "location", "description", "actions", "dialogue", "camera", "lighting", "animationPrompt", "musicSuggestion", "soundEffectSuggestion"] as const) if (typeof s[key] === "string") patch[key] = s[key].slice(0, 10000);
        if (Array.isArray(s.characters) && s.characters.every((name: unknown) => typeof name === "string")) patch.characters = s.characters.slice(0, 30);
        if (Object.keys(patch).length) await tx.update(scenes).set(patch).where(eq(scenes.id, s.id));
      }
      if (Array.isArray(body.deletedSceneIds)) for (const sceneId of body.deletedSceneIds) if (current.scenes.some(s => s.id === sceneId)) await tx.delete(scenes).where(eq(scenes.id, sceneId));
    });
    return Response.json({ success: true, story: await getStory(id) });
  } catch (e) { return errorResponse(e); }
}
export async function DELETE(request: Request, { params }: Context) {
  const rejected = rejectRequest(request, 30); if (rejected) return rejected;
  const { id } = await params; if (!validId(id)) return Response.json({ success: false, error: "Invalid story ID" }, { status: 400 });
  try { const [deleted] = await db.delete(stories).where(eq(stories.id, id)).returning(); return deleted ? Response.json({ success: true }) : Response.json({ success: false, error: "Story not found" }, { status: 404 }); } catch (e) { return errorResponse(e); }
}
