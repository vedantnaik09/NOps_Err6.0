"use client";

import { Bot, Brain, Clock, MessageSquareText, Shield, LineChart, LucideProps } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GradientText } from "@/components/ui/gradient-text";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface feature {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  title: string;
  description: string;
}

const features = [
  {
    icon: MessageSquareText,
    title: "Real-time Transcription",
    description: "Live call transcription powered by OpenAI Whisper for accurate documentation.",
  },
  {
    icon: Brain,
    title: "Sentiment Analysis",
    description: "Advanced sentiment analysis using Llama 3.2 to prioritize critical cases.",
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description: "Automated callback scheduling based on priority and agent availability.",
  },
  {
    icon: Bot,
    title: "AI Knowledge Base",
    description: "Instant access to solutions through Milvus-powered knowledge repository.",
  },
  {
    icon: Shield,
    title: "Secure Data Storage",
    description: "Enterprise-grade PostgreSQL database for reliable data management.",
  },
  {
    icon: LineChart,
    title: "Performance Analytics",
    description: "Comprehensive insights into call metrics and agent performance.",
  },
];

function FeatureCard({ icon: Icon, title, description }: feature) {
  return (
    <Card className="group relative overflow-hidden p-8 transition-all hover:shadow-2xl hover:shadow-purple-100/50 dark:hover:shadow-purple-900/50">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="mb-6 inline-block rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-3 text-white">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-3 text-xl font-semibold">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Card>
  );
}

export default function Features() {
  return (
    <section className="relative py-20 bg-gray-50/50 dark:bg-gray-900/50 min-h-[100vh]">
      <div className="container mx-auto px-4 mt-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <GradientText>Intelligent Features</GradientText> for Modern BPOs
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Streamline your operations with our comprehensive suite of AI-powered tools
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}