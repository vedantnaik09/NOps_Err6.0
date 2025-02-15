"use client";

import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { CTA } from "@/components/sections/cta";

declare global {
  interface Window {
    vis: any;
  }
}

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-gray-950">
      <video
        className="absolute inset-0 h-full object-cover"
        autoPlay
        muted
        loop
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}