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
    title: "Multi-PDF Autonomous Analysis",
    description: "Analyze multiple PDFs concurrently—extracting and processing nested tables, diagrams, and complex layouts.",
  },
  {
    icon: Brain,
    title: "Advanced OCR & AI Beyond Text",
    description: "Handle scanned documents using near-human accuracy OCR and contextual AI processing for handwritten and multi-column data.",
  },
  {
    icon: Clock,
    title: "Dynamic Cognitive Q&A",
    description: "Engage with a multi-layered Q&A system that retains context across follow-up queries, providing in-depth insights.",
  },
  {
    icon: Bot,
    title: "Real-time Knowledge Graph Generation",
    description: "Automatically generate interactive knowledge graphs that showcase relationships between entities, dates, and concepts.",
  },
  {
    icon: Shield,
    title: "Predictive Document Insights",
    description: "Go beyond static analysis—predict trends, flag anomalies and recommend actions based on extracted data.",
  },
  {
    icon: LineChart,
    title: "Cross-Document Correlation Engine",
    description: "Correlate information across independent documents, detecting discrepancies and uncovering hidden patterns.",
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

export function Features() {
  return (
    <section className="relative py-20 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <GradientText>Cutting-Edge Capabilities</GradientText> to Transform PDF Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our platform delivers advanced AI-powered features enabling autonomous analysis,
            context retention, and real-time knowledge generation from complex document data.
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
