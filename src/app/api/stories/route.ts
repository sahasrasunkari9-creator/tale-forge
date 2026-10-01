import { createStory, getStory, listStories } from "@/lib/story-repository";
import { generateStory } from "@/lib/story-service";
import { corsOptions, errorResponse, invalidInput, parseStoryInput, rejectRequest } from "@/lib/api";

export const dynamic = "force-dynamic";
export function OPTIONS(request: Request) { return corsOptions(request); }
export async function GET(request: Request) {
  const rejected = rejectRequest(request, 90); if (rejected) return rejected;
  try { return Response.json({ success: true, stories: await listStories() }); } catch (e) { return errorResponse(e); }
}
export async function POST(request: Request) {
  const rejected = rejectRequest(request, 10); if (rejected) return rejected;
  try {
    const input = parseStoryInput(await request.json()); if (!input) return invalidInput();
    const generated = await generateStory(input);
    const created = await createStory(input, generated);
    const story = await getStory(created.id);
    return Response.json({ success: true, storyId: created.id, title: created.title, logline: created.logline, characters: story?.characters || [], scenes: story?.scenes || [], story }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
