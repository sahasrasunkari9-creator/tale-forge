export type Character = { id: string; storyId: string; name: string; age: number | null; role: string; personality: string; appearance: string; objective: string };
export type Scene = { id: string; storyId: string; sceneNumber: number; title: string; location: string; characters: string[]; description: string; actions: string; dialogue: string; camera: string; lighting: string; animationPrompt: string; musicSuggestion: string; soundEffectSuggestion: string };
export type Story = { id: string; userId: string; title: string; logline: string; idea: string; genre: string; length: string; ageGroup: string; animationStyle: string; createdAt: string; updatedAt: string; characters: Character[]; scenes: Scene[] };
export type StorySummary = Omit<Story, "characters" | "scenes">;
export type StoryOptions = { idea: string; genre: string; length: string; ageGroup: string; animationStyle: string };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } }); }
  catch { throw new Error("Connection error. We couldn't reach the server. Please check your connection and try again."); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong while generating your story. Please try again.");
  return data as T;
}
export const storyApi = {
  list: () => request<{ success: boolean; stories: StorySummary[] }>("/api/stories"),
  get: (id: string) => request<{ success: boolean; story: Story }>(`/api/stories/${id}`),
  create: (input: StoryOptions) => request<{ success: boolean; storyId: string; story: Story }>("/api/stories", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, patch: object) => request<{ success: boolean; story: Story }>(`/api/stories/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  delete: (id: string) => request<{ success: boolean }>(`/api/stories/${id}`, { method: "DELETE" }),
  regenerate: (id: string) => request<{ success: boolean; story: Story }>(`/api/stories/${id}/regenerate`, { method: "POST" }),
  regenerateScene: (id: string) => request<{ success: boolean; scene: Scene }>(`/api/scenes/${id}/regenerate`, { method: "POST" }),
};
