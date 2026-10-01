import { db } from "@/db";
import { scenes, stories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { regenerateScene } from "@/lib/story-service";
import { corsOptions, errorResponse, rejectRequest, validId } from "@/lib/api";

export function OPTIONS(request: Request) { return corsOptions(request); }
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const rejected = rejectRequest(request, 15); if (rejected) return rejected;
  const { id } = await params; if (!validId(id)) return Response.json({ success: false, error: "Invalid scene ID" }, { status: 400 });
  try {
    const [scene] = await db.select().from(scenes).where(eq(scenes.id, id));
    if (!scene) return Response.json({ success: false, error: "Scene not found" }, { status: 404 });
    const [story] = await db.select().from(stories).where(eq(stories.id, scene.storyId));
    if (!story) return Response.json({ success: false, error: "Story not found" }, { status: 404 });
    const regenerated = await regenerateScene(story, scene);
    const [updated] = await db.update(scenes).set({ title: regenerated.title, location: regenerated.location || "", characters: regenerated.characters || [], description: regenerated.description, actions: regenerated.actions || "", dialogue: regenerated.dialogue || "", camera: regenerated.camera || "", lighting: regenerated.lighting || "", animationPrompt: regenerated.animationPrompt, musicSuggestion: regenerated.musicSuggestion || "", soundEffectSuggestion: regenerated.soundEffectSuggestion || "" }).where(eq(scenes.id, id)).returning();
    await db.update(stories).set({ updatedAt: new Date() }).where(eq(stories.id, story.id));
    return Response.json({ success: true, scene: updated });
  } catch (e) { return errorResponse(e); }
}
