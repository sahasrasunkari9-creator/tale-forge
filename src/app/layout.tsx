import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "StoryVerse – AI Story Generator",
  description: "Turn your imagination into a story. Create characters, scenes, storyboards, and cinematic previews with AI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
