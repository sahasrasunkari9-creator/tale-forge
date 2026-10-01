export type StoryInput = { idea: string; genre: string; length: string; ageGroup: string; animationStyle: string };
export type GeneratedCharacter = { name: string; age: number | null; role: string; personality: string; appearance: string; objective: string };
export type GeneratedScene = { sceneNumber: number; title: string; location: string; characters: string[]; description: string; actions: string; dialogue: string; camera: string; lighting: string; animationPrompt: string; musicSuggestion: string; soundEffectSuggestion: string };
export type GeneratedStory = { title: string; logline: string; characters: GeneratedCharacter[]; scenes: GeneratedScene[] };

export const demoIdea = "A young girl discovers a tiny dragon inside an abandoned library.";

const demoBeats = [
  { title: "The Forgotten Library", location: "An abandoned library at dusk", description: "Maya slips through the creaking doors of a library nobody has visited in years. Dust dances in a shaft of fading sunlight.", actions: "Maya brushes dust from an enormous book and hears a tiny rustle between the pages.", dialogue: "Maya: 'Hello? Is someone there?'", camera: "Wide establishing shot, slowly dolly in behind Maya as she enters.", lighting: "Dusky blue window light with warm amber highlights.", animationPrompt: "Animate drifting dust motes, swaying cobwebs, and a cautious child stepping through a grand old library.", musicSuggestion: "Soft, curious piano with distant strings.", soundEffectSuggestion: "Creaking door, gentle footsteps, rustling pages." },
  { title: "A Spark Between Pages", location: "The library's reading room", description: "A little golden glow peeks out from the pages of an ancient atlas. A dragon no bigger than Maya's hand blinks up at her.", actions: "Pip tumbles out of the book, sneezes a tiny shower of harmless sparks, and lands on Maya's palm.", dialogue: "Pip: 'You're not a librarian, are you?' Maya: 'You're a dragon!'", camera: "Close-up on the book, rack focus to Pip's glowing eyes.", lighting: "Warm golden dragon light against cool moonlit shelves.", animationPrompt: "Animate a tiny expressive dragon emerging from a book, fluttering wings and magical glowing sparks.", musicSuggestion: "Playful celesta and pizzicato strings.", soundEffectSuggestion: "Page flutter, little sneeze, magical chime." },
  { title: "The Secret of the Stories", location: "A hidden alcove", description: "Pip reveals that every forgotten story in the library is slowly losing its magic. Without a reader, the stories will disappear forever.", actions: "Pip guides Maya to a wall of books whose words are fading before their eyes.", dialogue: "Pip: 'Stories only live when someone believes in them.' Maya: 'Then let's make them remember.'", camera: "Tracking shot following the pair through narrowing aisles.", lighting: "Flickering golden runes beneath deep violet shadows.", animationPrompt: "Show book spines dimming one by one while glowing letters drift from pages into the air.", musicSuggestion: "Tender strings building into a mysterious melody.", soundEffectSuggestion: "Whispering pages, soft magical hum." },
  { title: "The Map of Lost Tales", location: "The library's map chamber", description: "A living map reveals the Heart of Stories hidden at the top of the library's clock tower.", actions: "Maya unfolds a map that becomes a miniature floating landscape; Pip points to the tower.", dialogue: "Maya: 'All the way up there?' Pip: 'I'll fly. You can be brave.'", camera: "Overhead shot of the map unfolding into a glowing world.", lighting: "Teal map glow illuminating their determined faces.", animationPrompt: "Animate parchment transforming into a floating miniature world with a glowing path to a clock tower.", musicSuggestion: "Adventurous woodwinds and rising percussion.", soundEffectSuggestion: "Parchment unfolding, magical shimmer, clock ticking." },
  { title: "The Staircase of Whispers", location: "A spiral staircase", description: "The staircase shifts with every step, testing Maya with echoes of her own doubts.", actions: "Maya steadies herself as stairs rearrange; Pip lights the way with his wings.", dialogue: "Whisper: 'You're too small.' Maya: 'Maybe. But I'm not turning back.'", camera: "Orbiting camera ascending with Maya on the twisting staircase.", lighting: "Deep blue shadows pierced by Pip's amber glow.", animationPrompt: "Animate a moving spiral staircase, drifting shadow whispers, and a small dragon lighting a brave path.", musicSuggestion: "Tense pulsing strings resolving into hopeful piano.", soundEffectSuggestion: "Stone shifting, echoing whispers, wing flutters." },
  { title: "The Clockwork Guardian", location: "The clock tower", description: "A great clockwork owl blocks the way to the Heart of Stories, guarding it from anyone who might forget it again.", actions: "Maya offers the owl her favorite memory of reading with her grandmother instead of fighting it.", dialogue: "Maya: 'I won't let them be forgotten.' Guardian: 'Then show me you remember.'", camera: "Low angle reveal of the towering owl, then intimate close-up on Maya.", lighting: "Moonlight through clock gears and a gentle golden heart glow.", animationPrompt: "Animate an imposing mechanical owl unfolding brass wings amid turning clock gears.", musicSuggestion: "Grand orchestral swell softening into a heartfelt theme.", soundEffectSuggestion: "Clock gears, metallic wing movement, heartbeat pulse." },
  { title: "A Library Awakens", location: "The heart chamber", description: "Maya reads aloud from a fading book. Her words reignite the Heart of Stories, sending color and life through every shelf.", actions: "Pip circles the glowing heart as magical words rush back into thousands of books.", dialogue: "Maya: 'Once upon a time...' Pip: 'That's all it takes.'", camera: "Sweeping crane shot spiraling out from the heart across the library.", lighting: "Radiant gold blooms through the room, replacing the darkness.", animationPrompt: "Animate luminous words flowing like ribbons, books lighting up, and a joyful dragon soaring through golden light.", musicSuggestion: "Triumphant orchestral theme with warm choir-like pads, no vocals.", soundEffectSuggestion: "Magical rush, pages turning, sparkling chimes." },
  { title: "The Next Chapter", location: "The library entrance at sunrise", description: "At sunrise, the doors open to a line of new readers. Maya and Pip exchange a knowing smile: their story is only beginning.", actions: "Maya welcomes children inside while Pip peeks mischievously from her coat pocket.", dialogue: "Pip: 'What story next?' Maya: 'Let's find out together.'", camera: "Slow pullback from Maya and Pip to the sunlit library facade.", lighting: "Soft peach sunrise with warm inviting interior light.", animationPrompt: "Animate sunrise spilling into a restored library, delighted readers entering, and a tiny dragon peeking from a pocket.", musicSuggestion: "Hopeful piano and sweeping strings, gentle ending.", soundEffectSuggestion: "Morning birds, opening doors, happy footsteps." },
];

export function makeDemoStory(): GeneratedStory {
  return {
    title: "The Dragon in the Library",
    logline: "When a curious girl finds a tiny dragon in a forgotten library, she must bring its fading stories back to life before their magic disappears forever.",
    characters: [
      { name: "Maya", age: 12, role: "Protagonist", personality: "Curious, courageous, and quietly determined", appearance: "Dark curly hair, a teal coat, and a well-loved satchel", objective: "Save the library's forgotten stories" },
      { name: "Pip", age: null, role: "Magical companion", personality: "Witty, loyal, and a little dramatic", appearance: "A palm-sized amber dragon with luminous wings", objective: "Protect the Heart of Stories" },
      { name: "The Guardian", age: null, role: "Guardian", personality: "Wise, wary, and deeply devoted", appearance: "A towering brass clockwork owl with moonstone eyes", objective: "Keep the Heart of Stories safe" },
    ],
    scenes: demoBeats.map((beat, index) => ({ sceneNumber: index + 1, characters: index < 2 ? ["Maya", "Pip"] : index === 5 ? ["Maya", "Pip", "The Guardian"] : ["Maya", "Pip"], ...beat })),
  };
}

function fallbackStory(input: StoryInput): GeneratedStory {
  if (input.idea.toLowerCase().includes("dragon") && input.idea.toLowerCase().includes("librar")) return makeDemoStory();
  const subject = input.idea.trim().replace(/[.!?]+$/, "");
  const first = subject.split(/\s+/).slice(0, 7).join(" ");
  const title = first.charAt(0).toUpperCase() + first.slice(1);
  const names = ["The Beginning", "An Unexpected Discovery", "A New Ally", "The Hidden Path", "The First Challenge", "A Difficult Choice", "The Turning Point", "A New Beginning"];
  const count = input.length === "Short" ? 4 : input.length === "Long" ? 10 : 8;
  return {
    title: title.length > 48 ? title.slice(0, 45) + "..." : title,
    logline: `In this ${input.genre.toLowerCase()} adventure, ${subject.charAt(0).toLowerCase() + subject.slice(1)}—and an unexpected journey changes everything.`,
    characters: [
      { name: "The Dreamer", age: null, role: "Protagonist", personality: "Curious and resilient", appearance: `Expressive character designed in a ${input.animationStyle.toLowerCase()} style`, objective: "Discover the truth and follow the story's promise" },
      { name: "The Guide", age: null, role: "Companion", personality: "Warm, clever, and reassuring", appearance: "A memorable silhouette with a playful presence", objective: "Help the protagonist overcome the unknown" },
    ],
    scenes: Array.from({ length: count }, (_, i) => ({
      sceneNumber: i + 1, title: names[i % names.length], location: i === 0 ? "The world of the story" : i === count - 1 ? "A transformed world" : "A new place along the journey", characters: ["The Dreamer", "The Guide"],
      description: i === 0 ? `Our story begins: ${subject}. A small moment hints that something extraordinary is about to happen.` : i === count - 1 ? `The journey comes full circle. What began with ${subject.toLowerCase()} now opens the door to a brighter future.` : `As the story unfolds, the mystery of ${subject.toLowerCase()} grows deeper. A new discovery changes the path ahead.`,
      actions: i === 0 ? "The Dreamer notices a strange detail and steps closer to investigate." : "The Dreamer and The Guide explore, react, and move the story forward together.",
      dialogue: i === 0 ? "The Dreamer: 'This is where it all begins.'" : i === count - 1 ? "The Guide: 'Every ending is another beginning.'" : "The Dreamer: 'There must be more to this.' The Guide: 'Then let's find out.'",
      camera: i % 2 ? "Slow tracking shot moving alongside the characters, ending in a close-up." : "Wide cinematic establishing shot, gently pushing toward the action.", lighting: i === count - 1 ? "Warm sunrise and hopeful soft light." : "Atmospheric volumetric light with rich cinematic contrast.",
      animationPrompt: `Create a ${input.animationStyle.toLowerCase()} animated sequence for scene ${i + 1}: ${subject}. Show expressive character movement, layered depth, and a cinematic transition.`,
      musicSuggestion: i === count - 1 ? "Warm, uplifting orchestral resolution." : "Atmospheric instrumental score with a sense of wonder.", soundEffectSuggestion: "Subtle environmental ambience, footsteps, and gentle magical accents.",
    })),
  };
}

function validStory(data: unknown): data is GeneratedStory {
  if (!data || typeof data !== "object") return false;
  const s = data as GeneratedStory;
  return typeof s.title === "string" && typeof s.logline === "string" && Array.isArray(s.characters) && s.characters.length > 0 && s.characters.every(c => typeof c.name === "string" && typeof c.role === "string") && Array.isArray(s.scenes) && s.scenes.length > 0 && s.scenes.every(sc => typeof sc.title === "string" && typeof sc.description === "string" && typeof sc.dialogue === "string" && typeof sc.animationPrompt === "string");
}

export async function generateStory(input: StoryInput): Promise<GeneratedStory> {
  if (!process.env.AI_API_KEY) return fallbackStory(input);
  const response = await fetch(process.env.AI_BASE_URL || "https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_API_KEY}` },
    body: JSON.stringify({ model: process.env.AI_MODEL || "gpt-4o-mini", response_format: { type: "json_object" }, messages: [
      { role: "system", content: "You are a cinematic animated story writer. Return ONLY a valid JSON object with title, logline, characters array (name, age number or null, role, personality, appearance, objective), and scenes array (sceneNumber number, title, location, characters array of names, description, actions, dialogue, camera, lighting, animationPrompt, musicSuggestion, soundEffectSuggestion). Make a cohesive original story with clear beginning, middle, end. Dialogue is TEXT ONLY. Never generate audio, voice, narration, voice cloning or speech synthesis. Music and sound effects are suggestions only." },
      { role: "user", content: `Create a ${input.length.toLowerCase()} ${input.genre.toLowerCase()} story for ${input.ageGroup.toLowerCase()} in ${input.animationStyle.toLowerCase()} animation style. Idea: ${input.idea}. Include ${input.length === "Short" ? 4 : input.length === "Long" ? 10 : 8} detailed scenes.` },
    ] }), signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error("AI generation failed");
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  const parsed: unknown = JSON.parse(content);
  if (!validStory(parsed)) throw new Error("Invalid AI story response");
  return parsed;
}

export async function regenerateScene(story: StoryInput, scene: GeneratedScene): Promise<GeneratedScene> {
  if (!process.env.AI_API_KEY) return { ...scene, description: `${scene.description} A fresh detail brings this moment to life in an unexpected way.`, camera: "Slow cinematic push-in, then a sweeping reveal of the environment.", animationPrompt: `${scene.animationPrompt} Add expressive reactions, atmospheric particles, and a fresh visual beat.` };
  const response = await fetch(process.env.AI_BASE_URL || "https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_API_KEY}` }, body: JSON.stringify({ model: process.env.AI_MODEL || "gpt-4o-mini", response_format: { type: "json_object" }, messages: [{ role: "system", content: "Return JSON only: a scene object with sceneNumber, title, location, characters (array of names), description, actions, dialogue (text only), camera, lighting, animationPrompt, musicSuggestion, soundEffectSuggestion. Never generate voice or narration." }, { role: "user", content: `Regenerate this scene with a fresh cinematic take while preserving its role in the story. Story idea: ${story.idea}. Scene: ${JSON.stringify(scene)}` }] }), signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error("AI generation failed");
  const payload = await response.json();
  const parsed = JSON.parse(payload.choices?.[0]?.message?.content || "null");
  if (!parsed || typeof parsed.title !== "string" || typeof parsed.description !== "string") throw new Error("Invalid scene response");
  return { ...scene, ...parsed, sceneNumber: scene.sceneNumber };
}
