import { db } from "@/db";
import { users, stories, characters, scenes } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { demoIdea, makeDemoStory, type GeneratedStory, type StoryInput } from "@/lib/story-service";

const demoEmail = "demo@storyverse.local";

export async function getDemoUser() {
  await db.insert(users).values({ name: "StoryVerse Creator", email: demoEmail }).onConflictDoNothing();
  const [user] = await db.select().from(users).where(eq(users.email, demoEmail));
  return user;
}

export async function createStory(input: StoryInput, generated: GeneratedStory, userId?: string) {
  const user = userId || (await getDemoUser()).id;
  return db.transaction(async tx => {
    const [story] = await tx.insert(stories).values({ userId: user, title: generated.title, logline: generated.logline, ...input }).returning();
    if (generated.characters.length) await tx.insert(characters).values(generated.characters.map(c => ({ storyId: story.id, name: c.name, age: typeof c.age === "number" ? c.age : null, role: c.role || "Character", personality: c.personality || "", appearance: c.appearance || "", objective: c.objective || "" })));
    if (generated.scenes.length) await tx.insert(scenes).values(generated.scenes.map((s, i) => ({ storyId: story.id, sceneNumber: i + 1, title: s.title, location: s.location || "", characters: Array.isArray(s.characters) ? s.characters : [], description: s.description || "", actions: s.actions || "", dialogue: s.dialogue || "", camera: s.camera || "", lighting: s.lighting || "", animationPrompt: s.animationPrompt || "", musicSuggestion: s.musicSuggestion || "", soundEffectSuggestion: s.soundEffectSuggestion || "" })));
    return story;
  });
}

export async function ensureDemoStory() {
  const user = await getDemoUser();
  const existing = await db.select({ id: stories.id }).from(stories).where(eq(stories.userId, user.id)).limit(1);
  if (!existing.length) await createStory({ idea: demoIdea, genre: "Fantasy", length: "Medium", ageGroup: "Everyone", animationStyle: "Cinematic" }, makeDemoStory(), user.id);
  return user;
}

export async function listStories() {
  const user = await ensureDemoStory();
  return db.select().from(stories).where(eq(stories.userId, user.id)).orderBy(desc(stories.updatedAt));
}

export async function getStory(id: string) {
  const [story] = await db.select().from(stories).where(eq(stories.id, id));
  if (!story) return null;
  const [storyCharacters, storyScenes] = await Promise.all([
    db.select().from(characters).where(eq(characters.storyId, id)),
    db.select().from(scenes).where(eq(scenes.storyId, id)).orderBy(asc(scenes.sceneNumber)),
  ]);
  return { ...story, characters: storyCharacters, scenes: storyScenes };
}

export async function replaceStory(id: string, input: StoryInput, generated: GeneratedStory) {
  return db.transaction(async tx => {
    const [updated] = await tx.update(stories).set({ ...input, title: generated.title, logline: generated.logline, updatedAt: new Date() }).where(eq(stories.id, id)).returning();
    if (!updated) return null;
    await tx.delete(characters).where(eq(characters.storyId, id));
    await tx.delete(scenes).where(eq(scenes.storyId, id));
    if (generated.characters.length) await tx.insert(characters).values(generated.characters.map(c => ({ storyId: id, name: c.name, age: typeof c.age === "number" ? c.age : null, role: c.role || "Character", personality: c.personality || "", appearance: c.appearance || "", objective: c.objective || "" })));
    if (generated.scenes.length) await tx.insert(scenes).values(generated.scenes.map((s, i) => ({ storyId: id, sceneNumber: i + 1, title: s.title, location: s.location || "", characters: Array.isArray(s.characters) ? s.characters : [], description: s.description || "", actions: s.actions || "", dialogue: s.dialogue || "", camera: s.camera || "", lighting: s.lighting || "", animationPrompt: s.animationPrompt || "", musicSuggestion: s.musicSuggestion || "", soundEffectSuggestion: s.soundEffectSuggestion || "" })));
    return updated;
  });
}
