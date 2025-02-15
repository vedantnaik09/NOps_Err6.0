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
    title: "Real-time Complaint Logging",
    description: "Instant logging of complaints through user-friendly interfaces, ensuring prompt attention to every issue.",
  },
  {
    icon: Brain,
    title: "Issue Sentiment Analysis",
    description: "AI-powered sentiment analysis to identify urgent or sensitive complaints and prioritize resolution.",
  },
  {
    icon: Clock,
    title: "Automated Response Time Tracking",
    description: "Track response times automatically to ensure timely resolutions for every registered complaint.",
  },
  {
    icon: Bot,
    title: "AI-driven Case Suggestions",
    description: "Get automated case suggestions and solutions based on historical data and community feedback.",
  },
  {
    icon: Shield,
    title: "Data Protection & Privacy",
    description: "Secure complaint data storage using enterprise-level encryption and compliance with local data regulations.",
  },
  {
    icon: LineChart,
    title: "Complaint Analytics & Reporting",
    description: "Comprehensive insights into complaint trends, resolution times, and staff performance for continuous improvement.",
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

export function Features() {
  return (
    <section className="relative py-20 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <GradientText>Advanced Features</GradientText> for Seamless Complaint Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enhance your municipal corporation’s complaint management system with our AI-powered tools.
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
