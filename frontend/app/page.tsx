"use client";

import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { CTA } from "@/components/sections/cta";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}