"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, Clapperboard, Clock3, Film, Fullscreen, Lightbulb, Loader2, Menu, MoreHorizontal, Music2, Pause, PenLine, Play, Plus, RefreshCw, Save, ScrollText, Sparkles, Trash2, Users, Volume2, VolumeX, WandSparkles, X } from "lucide-react";
import { storyApi, type Character, type Scene, type Story, type StoryOptions, type StorySummary } from "@/lib/story-api";

const initialOptions: StoryOptions = { idea: "", genre: "Fantasy", length: "Medium", ageGroup: "Everyone", animationStyle: "Cinematic" };
const steps = ["Idea", "Generating Story", "Creating Characters", "Creating Scenes", "Building Storyboard", "Ready"];
type EditTarget = { type: "story"; data: Story } | { type: "character"; data: Character } | { type: "scene"; data: Scene };
const sceneFields: (keyof Scene)[] = ["title", "location", "description", "actions", "dialogue", "camera", "lighting", "animationPrompt", "musicSuggestion", "soundEffectSuggestion"];
const characterFields: (keyof Character)[] = ["name", "role", "personality", "appearance", "objective"];
const label = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());

export default function StoryVerseApp() {
  const [form, setForm] = useState<StoryOptions>(initialOptions);
  const [saved, setSaved] = useState<StorySummary[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeScene, setActiveScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [music, setMusic] = useState(true);
  const [sfx, setSfx] = useState(true);
  const [edit, setEdit] = useState<EditTarget | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<HTMLElement>(null);

  const refreshList = useCallback(async () => { const res = await storyApi.list(); setSaved(res.stories); return res.stories; }, []);
  useEffect(() => {
    let alive = true;
    storyApi.list().then(async res => {
      if (!alive) return;
      setSaved(res.stories);
      if (res.stories.length) { const detail = await storyApi.get(res.stories[0].id); if (alive) setStory(detail.story); }
    }).catch(() => { if (alive) setError("Connection error. We couldn't reach the server. Please refresh and try again."); }).finally(() => { if (alive) setLoadingList(false); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (!playing || !story?.scenes.length) return;
    const timer = window.setInterval(() => setActiveScene(n => (n + 1) % story.scenes.length), 6500);
    return () => window.clearInterval(timer);
  }, [playing, story?.scenes.length]);
  useEffect(() => {
    if (!working) return;
    const timer = window.setInterval(() => setProgress(p => Math.min(p + 1, 4)), 1250);
    return () => window.clearInterval(timer);
  }, [working]);
  useEffect(() => { if (notice) { const timer = window.setTimeout(() => setNotice(""), 4000); return () => window.clearTimeout(timer); } }, [notice]);

  async function generate() {
    if (form.idea.trim().length < 10) { setError("Tell us a little more about your idea (at least 10 characters)."); return; }
    setError(""); setWorking(true); setProgress(1);
    try {
      const result = await storyApi.create(form);
      setProgress(5); setStory(result.story); setActiveScene(0); setPlaying(false); await refreshList();
      setNotice("Your story is ready. Welcome to your new world!");
      window.setTimeout(() => studioRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong while generating your story. Please try again."); }
    finally { setWorking(false); }
  }
  async function selectStory(id: string) {
    setError(""); setPlaying(false);
    try { const res = await storyApi.get(id); setStory(res.story); setActiveScene(0); studioRef.current?.scrollIntoView({ behavior: "smooth" }); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load story."); }
  }
  async function removeStory(id: string) {
    if (!window.confirm("Delete this story and all its scenes? This can't be undone.")) return;
    try { await storyApi.delete(id); const list = await refreshList(); if (story?.id === id) { if (list.length) { const res = await storyApi.get(list[0].id); setStory(res.story); } else setStory(null); } setNotice("Story deleted."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete story."); }
  }
  async function regenerateWhole() {
    if (!story || working || !window.confirm("Regenerate this story? Your current characters and scenes will be replaced.")) return;
    setWorking(true); setProgress(1); setError("");
    try { const res = await storyApi.regenerate(story.id); setStory(res.story); setActiveScene(0); setProgress(5); await refreshList(); setNotice("Story regenerated successfully."); }
    catch (e) { setError(e instanceof Error ? e.message : "Something went wrong while generating your story. Please try again."); }
    finally { setWorking(false); }
  }
  async function regenerateOne(scene: Scene) {
    setSaving(true); setError("");
    try { const res = await storyApi.regenerateScene(scene.id); setStory(s => s ? { ...s, scenes: s.scenes.map(sc => sc.id === scene.id ? res.scene : sc) } : s); setNotice(`Scene ${scene.sceneNumber} regenerated.`); }
    catch (e) { setError(e instanceof Error ? e.message : "Something went wrong while generating your story. Please try again."); }
    finally { setSaving(false); }
  }
  async function deleteScene(scene: Scene) {
    if (!story || !window.confirm(`Delete "${scene.title}"?`)) return;
    try { const res = await storyApi.update(story.id, { deletedSceneIds: [scene.id] }); setStory(res.story); setActiveScene(0); setNotice("Scene deleted."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete scene."); }
  }
  function openEdit(target: EditTarget) {
    setEdit(target);
    if (target.type === "story") setDraft({ title: target.data.title, logline: target.data.logline, idea: target.data.idea });
    else if (target.type === "character") setDraft(Object.fromEntries(characterFields.map(k => [k, String(target.data[k] ?? "")])));
    else setDraft({ ...Object.fromEntries(sceneFields.map(k => [k, String(target.data[k] ?? "")])), characters: target.data.characters.join(", ") });
  }
  async function saveEdit() {
    if (!story || !edit) return;
    setSaving(true);
    try {
      let patch: object;
      if (edit.type === "story") patch = { title: draft.title, logline: draft.logline, idea: draft.idea };
      else if (edit.type === "character") patch = { characters: [{ id: edit.data.id, ...draft }] };
      else patch = { scenes: [{ id: edit.data.id, ...draft, characters: (draft.characters || "").split(",").map(n => n.trim()).filter(Boolean) }] };
      const res = await storyApi.update(story.id, patch); setStory(res.story); await refreshList(); setEdit(null); setNotice("Changes saved.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save changes."); }
    finally { setSaving(false); }
  }
  const scene = story?.scenes[Math.min(activeScene, Math.max(0, story.scenes.length - 1))];
  const scrollStudio = () => studioRef.current?.scrollIntoView({ behavior: "smooth" });

  return <div className="site-shell">
    <div className="world-bg" aria-hidden="true"><div className="world-image" /><div className="world-fog fog-one" /><div className="world-fog fog-two" /><div className="particles">{Array.from({ length: 20 }, (_, i) => <i key={i} style={{ left: `${(i * 37 + 11) % 100}%`, top: `${(i * 29 + 13) % 95}%`, animationDelay: `${(i % 7) * -1.6}s`, animationDuration: `${5 + (i % 5) * 2}s` }} />)}</div></div>
    <div className="site-content">
      <header className="site-header wrap">
        <a href="#top" className="brand" aria-label="StoryVerse home"><span className="brand-mark"><Sparkles size={19} strokeWidth={2.2} /></span><span>story<span className="brand-light">verse</span><span className="brand-dot">.</span></span></a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation"><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#studio" onClick={() => setMenuOpen(false)}>My stories</a><a href="#storyboard" onClick={() => setMenuOpen(false)}>Storyboard</a></nav>
        <div className="header-actions"><button className="header-link" onClick={scrollStudio}>My workspace <ArrowRight size={15} /></button><button className="mobile-menu" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={22} /></button></div>
      </header>

      <main id="top">
        <section className="hero wrap">
          <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-icon"><Sparkles size={12} fill="currentColor" /></span> YOUR IDEAS, BROUGHT TO LIFE <span className="eyebrow-line" /></div>
            <h1>Turn Your<br /><em>Imagination</em><br />Into a Story<span className="heading-period">.</span></h1>
            <p className="hero-subtitle">Create amazing animated stories with AI.</p>
            <p className="hero-description">One spark of an idea becomes a world of characters, cinematic scenes, and a storyboard ready to explore.</p>
            <div className="hero-bottom"><button className="explore-link" onClick={scrollStudio}><span className="explore-circle"><ArrowDown size={17} /></span> Explore the studio</button><div className="hero-avatars"><div className="avatar-stack"><span>✦</span><span>✿</span><span>✧</span></div><span>Made for the<br /><strong>storyteller in you</strong></span></div></div>
          </div>
          <div className="generator-card" id="create"><div className="generator-top"><span className="form-icon"><WandSparkles size={21} /></span><div><div className="form-kicker">THE STORY STUDIO</div><h2>Start with a spark.</h2></div><span className="form-sparkle">✦</span></div>
            <div className="form-divider" />
            <label className="input-label" htmlFor="idea">YOUR STORY IDEA <span>✦</span></label>
            <div className="textarea-wrap"><textarea id="idea" placeholder="Describe your story idea..." value={form.idea} maxLength={2000} onChange={e => setForm({ ...form, idea: e.target.value })} /><span className="textarea-hint"><Lightbulb size={13} /> A little detail goes a long way</span></div>
            <div className="form-options"><div className="field"><label htmlFor="genre">Genre</label><div className="select-wrap"><select id="genre" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}>{["Fantasy", "Adventure", "Sci-Fi", "Mystery", "Romance", "Comedy", "Drama"].map(v => <option key={v}>{v}</option>)}</select><ChevronDown size={15} /></div></div><div className="field"><label htmlFor="length">Story length</label><div className="select-wrap"><select id="length" value={form.length} onChange={e => setForm({ ...form, length: e.target.value })}>{["Short", "Medium", "Long"].map(v => <option key={v}>{v}</option>)}</select><ChevronDown size={15} /></div></div><div className="field"><label htmlFor="ageGroup">Age group</label><div className="select-wrap"><select id="ageGroup" value={form.ageGroup} onChange={e => setForm({ ...form, ageGroup: e.target.value })}>{["Everyone", "Kids", "Teens", "Adults"].map(v => <option key={v}>{v}</option>)}</select><ChevronDown size={15} /></div></div><div className="field"><label htmlFor="style">Animation style</label><div className="select-wrap"><select id="style" value={form.animationStyle} onChange={e => setForm({ ...form, animationStyle: e.target.value })}>{["Cinematic", "Pixar-inspired", "Anime", "Watercolor", "Stop Motion"].map(v => <option key={v}>{v}</option>)}</select><ChevronDown size={15} /></div></div></div>
            <button className="generate-button" onClick={generate} disabled={working}>{working ? <><Loader2 size={18} className="spin" /> Creating your world...</> : <><Sparkles size={18} /> Generate Story <ArrowRight size={18} /></>}</button>
            <div className="form-foot"><span><span className="status-dot" /> Your imagination is the only limit</span><span>✦ &nbsp; MADE WITH MAGIC</span></div>
            {working && <div className="generation-progress" role="status"><div className="progress-head"><span>{steps[progress]}</span><span>{Math.round((progress / 5) * 100)}%</span></div><div className="progress-track"><span style={{ width: `${Math.max(8, progress * 20)}%` }} /></div><div className="progress-steps">{steps.map((step, i) => <span key={step} className={i <= progress ? "active" : ""}>{i < progress ? "✓ " : ""}{step}</span>)}</div></div>}
            {error && <div className="error-box" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X size={15} /></button></div>}
          </div>
        </section>
        <div className="hero-caption wrap"><span>✦ &nbsp; A NEW WAY TO TELL STORIES</span><span>SCROLL TO DISCOVER <ArrowDown size={13} /></span></div>
        <section className="journey-section" id="how-it-works"><div className="wrap"><div className="section-heading center"><span className="section-kicker">THE CREATIVE JOURNEY</span><h2>From a thought to <em>another world.</em></h2><p>Everything you need to bring a story to life, all in one place.</p></div><div className="journey-grid">{[{ icon: Lightbulb, number: "01", title: "Share your idea", description: "It starts with a single thought. Tell us what you imagine." }, { icon: WandSparkles, number: "02", title: "Watch it unfold", description: "AI shapes your idea into a rich story with memorable characters." }, { icon: Clapperboard, number: "03", title: "Explore each scene", description: "Dive into the storyboard and preview your story frame by frame." }].map(({ icon: Icon, number, title, description }) => <div className="journey-card" key={number}><div className="journey-icon"><Icon size={22} /></div><span className="journey-number">{number}</span><h3>{title}</h3><p>{description}</p></div>)}</div><div className="flow-line"><span>YOUR IDEA</span><ArrowRight size={15} /><span>AI STORY</span><ArrowRight size={15} /><span>CHARACTERS</span><ArrowRight size={15} /><span>SCENES</span><ArrowRight size={15} /><span>STORYBOARD</span><ArrowRight size={15} /><span>PREVIEW</span></div></div></section>
        <section className="workspace-section wrap" id="studio" ref={studioRef}><div className="workspace-heading"><div><span className="section-kicker">YOUR CREATIVE SPACE</span><h2>My <em>workspace.</em></h2><p>Your stories are just the beginning. Pick one up where you left off.</p></div><a href="#create" className="small-primary"><Plus size={17} /> Create new story</a></div>
          <div className="workspace-layout"><aside className="sidebar"><div className="sidebar-heading"><span><BookOpen size={17} /> SAVED STORIES</span><span className="count-pill">{saved.length}</span></div>{loadingList ? <div className="sidebar-loading"><Loader2 size={20} className="spin" /> Loading stories...</div> : saved.length ? <div className="saved-list">{saved.map(item => <div key={item.id} className={story?.id === item.id ? "saved-item selected" : "saved-item"}><button className="saved-main" onClick={() => selectStory(item.id)}><span className="saved-art"><BookOpen size={19} /></span><span className="saved-text"><strong>{item.title}</strong><small>{item.genre} · {item.length} story</small></span></button><button className="saved-delete" aria-label={`Delete ${item.title}`} title="Delete story" onClick={() => removeStory(item.id)}><Trash2 size={15} /></button></div>)}</div> : <div className="empty-sidebar">Your next great story starts above.</div>}<div className="sidebar-tip"><Sparkles size={16} /><p>Every great story begins with a little curiosity.</p></div></aside>
          <div className="story-area">{story ? <><div className="story-header"><div className="story-header-content"><div className="story-tags"><span><Sparkles size={12} /> FEATURED STORY</span><span>{story.genre}</span><span>{story.length}</span></div><h3>{story.title}</h3><p>{story.logline}</p><div className="story-meta"><span><Users size={15} /> {story.characters.length} characters</span><span><Clapperboard size={15} /> {story.scenes.length} scenes</span><span><Clock3 size={15} /> {new Date(story.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div></div><div className="story-header-actions"><button className="icon-button" title="Edit story" aria-label="Edit story" onClick={() => openEdit({ type: "story", data: story })}><PenLine size={17} /></button><button className="icon-button" title="Regenerate story" aria-label="Regenerate story" disabled={working} onClick={regenerateWhole}><RefreshCw size={17} className={working ? "spin" : ""} /></button></div></div>
          <div className="story-inner"><div className="content-title"><div><span className="section-kicker">MEET THE CAST</span><h3>Characters <span className="title-count">{story.characters.length.toString().padStart(2, "0")}</span></h3></div><p>The hearts behind the adventure</p></div><div className="character-grid">{story.characters.map((c, i) => <div className="character-card" key={c.id}><div className={`character-portrait portrait-${i % 3}`}><span>{c.name.slice(0, 1)}</span><span className="portrait-star">✦</span></div><div className="character-info"><div className="character-role">{c.role}</div><h4>{c.name}</h4><p>{c.personality}</p></div><button className="character-edit" aria-label={`Edit ${c.name}`} onClick={() => openEdit({ type: "character", data: c })}><PenLine size={15} /></button></div>)}</div>
          <div className="content-title storyboard-title" id="storyboard"><div><span className="section-kicker">FRAME BY FRAME</span><h3>The storyboard <span className="title-count">{story.scenes.length.toString().padStart(2, "0")}</span></h3></div><p>Every moment, beautifully mapped out</p></div>
          <div className="scene-list">{story.scenes.map((sc, i) => <article className="scene-card" key={sc.id}><div className="scene-preview" style={{ backgroundPosition: `${45 + (i % 4) * 9}% center` }}><div className="scene-shade" /><span className="scene-number">SCENE {String(sc.sceneNumber).padStart(2, "0")}</span><span className="scene-preview-icon"><Film size={18} /></span></div><div className="scene-body"><div className="scene-top"><div><span className="scene-location">✦ &nbsp;{sc.location}</span><h4>{sc.title}</h4></div><div className="scene-actions"><button title="Edit scene" aria-label={`Edit ${sc.title}`} onClick={() => openEdit({ type: "scene", data: sc })}><PenLine size={16} /></button><button title="Regenerate scene" aria-label={`Regenerate ${sc.title}`} disabled={saving} onClick={() => regenerateOne(sc)}><RefreshCw size={16} /></button><button title="Delete scene" aria-label={`Delete ${sc.title}`} onClick={() => deleteScene(sc)}><Trash2 size={16} /></button></div></div><p className="scene-description">{sc.description}</p><div className="scene-cast"><Users size={13} /> {sc.characters.join(" · ")}</div><div className="scene-detail-grid"><div><span>ACTION</span><p>{sc.actions}</p></div><div><span>DIALOGUE · TEXT ONLY</span><p className="dialogue">“{sc.dialogue}”</p></div><div><span>CAMERA & LIGHT</span><p>{sc.camera} {sc.lighting}</p></div><div><span>ANIMATION PROMPT</span><p>{sc.animationPrompt}</p></div></div><div className="scene-sound"><span><Music2 size={14} /> {sc.musicSuggestion}</span><span><Volume2 size={14} /> {sc.soundEffectSuggestion}</span></div></div></article>)}</div>
          <div className="content-title preview-heading"><div><span className="section-kicker">SEE IT COME ALIVE</span><h3>Animation preview</h3></div><p>A cinematic way to explore your scenes</p></div><div className="preview-shell" ref={previewRef}><div className="preview-stage" key={scene?.id || "none"}><div className="preview-photo" /><div className="preview-glow" /><div className="preview-grain" /><div className="preview-vignette" /><div className="preview-overlay"><span className="preview-scene-label">SCENE {String(scene?.sceneNumber || 1).padStart(2, "0")} / {String(story.scenes.length).padStart(2, "0")}</span><div><span className="preview-location">{scene?.location}</span><h4>{scene?.title || "Your story awaits"}</h4><p>{scene?.description}</p><span className="preview-dialogue">{scene?.dialogue}</span></div></div>{!playing && <button className="big-play" aria-label="Play preview" onClick={() => setPlaying(true)}><Play size={27} fill="currentColor" /></button>}</div><div className="preview-controls"><button className="control-main" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button><button aria-label="Previous scene" onClick={() => setActiveScene(n => (n - 1 + story.scenes.length) % story.scenes.length)}><ChevronLeft size={20} /></button><button aria-label="Next scene" onClick={() => setActiveScene(n => (n + 1) % story.scenes.length)}><ChevronRight size={20} /></button><span className="preview-time">{String(activeScene + 1).padStart(2, "0")} / {String(story.scenes.length).padStart(2, "0")}</span><div className="timeline">{story.scenes.map((sc, i) => <button key={sc.id} className={i <= activeScene ? "elapsed" : ""} aria-label={`Go to scene ${i + 1}`} title={sc.title} onClick={() => setActiveScene(i)} />)}</div><button className={music ? "toggle-active" : ""} title={music ? `Music cue on: ${scene?.musicSuggestion}` : "Music cue off"} aria-label="Toggle music suggestions" onClick={() => setMusic(!music)}><Music2 size={18} /></button><button className={sfx ? "toggle-active" : ""} title={sfx ? `Sound effects cue on: ${scene?.soundEffectSuggestion}` : "Sound effects cue off"} aria-label="Toggle sound effect suggestions" onClick={() => setSfx(!sfx)}>{sfx ? <Volume2 size={18} /> : <VolumeX size={18} />}</button><button title="Fullscreen" aria-label="Fullscreen" onClick={() => { if (document.fullscreenElement) document.exitFullscreen(); else previewRef.current?.requestFullscreen(); }}><Fullscreen size={18} /></button></div><div className="preview-cues"><span><Music2 size={13} /> Music {music ? "ON" : "OFF"}</span><span><Volume2 size={13} /> Sound effects {sfx ? "ON" : "OFF"}</span><span>Visual storyboard preview · text dialogue only</span></div></div>
          </div></> : <div className="empty-story"><ScrollText size={40} /><h3>Your story starts here</h3><p>Share an idea above to create your first project.</p><a href="#create" className="small-primary">Create a story <ArrowRight size={16} /></a></div>}</div></div>
        </section>
      </main><footer className="site-footer"><div className="wrap footer-inner"><a href="#top" className="brand"><span className="brand-mark"><Sparkles size={16} /></span><span>story<span className="brand-light">verse</span><span className="brand-dot">.</span></span></a><span>For the stories waiting to be told. ✦</span><span>© {new Date().getFullYear()} StoryVerse</span></div></footer>
    </div>
    {notice && <div className="toast"><Check size={17} />{notice}<button aria-label="Dismiss" onClick={() => setNotice("")}><X size={15} /></button></div>}
    {edit && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setEdit(null); }}><div className="edit-modal" role="dialog" aria-modal="true" aria-label={`Edit ${edit.type}`}><div className="modal-head"><div><span className="section-kicker">MAKE IT YOURS</span><h3>Edit {edit.type === "story" ? "story" : edit.type === "character" ? "character" : "scene"}</h3></div><button aria-label="Close editor" onClick={() => setEdit(null)}><X size={20} /></button></div><div className="modal-fields">{(edit.type === "story" ? ["title", "logline", "idea"] : edit.type === "character" ? characterFields : [...sceneFields, "characters"]).map(key => <label key={key}>{label(key)}{["description", "actions", "dialogue", "animationPrompt", "logline", "idea", "personality", "appearance", "objective"].includes(key) ? <textarea value={draft[key] || ""} onChange={e => setDraft({ ...draft, [key]: e.target.value })} rows={3} /> : <input value={draft[key] || ""} onChange={e => setDraft({ ...draft, [key]: e.target.value })} />}{key === "characters" && <small>Separate character names with commas.</small>}</label>)}</div><div className="modal-actions"><button className="cancel-button" onClick={() => setEdit(null)}>Cancel</button><button className="small-primary" disabled={saving} onClick={saveEdit}>{saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save changes</button></div></div></div>}
  </div>;
}
