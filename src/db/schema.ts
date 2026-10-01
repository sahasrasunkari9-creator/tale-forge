import { pgTable, uuid, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stories = pgTable("stories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  logline: text("logline").notNull().default(""),
  idea: text("idea").notNull(),
  genre: text("genre").notNull(),
  length: text("length").notNull(),
  ageGroup: text("age_group").notNull().default("Everyone"),
  animationStyle: text("animation_style").notNull().default("Cinematic"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  storyId: uuid("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age"),
  role: text("role").notNull(),
  personality: text("personality").notNull().default(""),
  appearance: text("appearance").notNull().default(""),
  objective: text("objective").notNull().default(""),
});

export const scenes = pgTable("scenes", {
  id: uuid("id").primaryKey().defaultRandom(),
  storyId: uuid("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  sceneNumber: integer("scene_number").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull().default(""),
  characters: jsonb("characters").$type<string[]>().notNull().default([]),
  description: text("description").notNull().default(""),
  actions: text("actions").notNull().default(""),
  dialogue: text("dialogue").notNull().default(""),
  camera: text("camera").notNull().default(""),
  lighting: text("lighting").notNull().default(""),
  animationPrompt: text("animation_prompt").notNull().default(""),
  musicSuggestion: text("music_suggestion").notNull().default(""),
  soundEffectSuggestion: text("sound_effect_suggestion").notNull().default(""),
});
