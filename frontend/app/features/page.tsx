"use client";

import { Bot, Brain, Clock, MessageSquareText, Shield, LineChart, LucideProps } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GradientText } from "@/components/ui/gradient-text";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface Feature {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: MessageSquareText,
    title: "Accurate OCR Processing",
    description: "Transform scanned PDFs into searchable text with near-human accuracy using advanced OCR algorithms.",
  },
  {
    icon: Brain,
    title: "Insight Extraction",
    description: "Leverage AI to analyze document content and extract valuable, actionable insights.",
  },
  {
    icon: Clock,
    title: "Automated Parsing",
    description: "Effortlessly parse complex document layouts—from multi-column formats to intricate tables and diagrams.",
  },
  {
    icon: Bot,
    title: "Dynamic Knowledge Graphs",
    description: "Visualize relationships and trends with interactive knowledge graphs that bring your data to life.",
  },
  {
    icon: Shield,
    title: "Secure Data Management",
    description: "Protect your sensitive documents with enterprise-grade security and reliable storage solutions.",
  },
  {
    icon: LineChart,
    title: "Predictive Analytics",
    description: "Harness predictive insights to forecast trends and enable proactive decision-making.",
  },
];

function FeatureCard({ icon: Icon, title, description }: Feature) {
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
            <GradientText>CogniSight Features</GradientText> for Intelligent Document Processing
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Revolutionize the way you manage and analyze documents with our comprehensive suite of AI-powered tools.
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