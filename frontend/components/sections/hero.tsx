"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/ui/gradient-text";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function Hero() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    if (token) {
      setUser({
        name: userType === "client" ? "Client User" : "Authority User",
      });
    }
  }, []);

  const handleAnalyzeDocument = () => {
    if (user) {
      router.push("/analyze");
    } else {
      router.push("/auth");
    }
  };

  const handleKnowledgeGraph = () => {
    if (user) {
      router.push("/knowledge-graph");
    } else {
      router.push("/contact");
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center">
      <div />
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-purple-100/20">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Autonomous PDF Analysis & Document Intelligence
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            Unlock Hidden Insights with <GradientText>AI-Powered Document Intelligence</GradientText>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
            Organizations worldwide are overwhelmed by complex, unstructured data locked within PDFs—
            from legal contracts to technical manuals. Our advanced platform autonomously analyzes,
            understands, and transforms these documents into actionable insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
              onClick={handleAnalyzeDocument}
            >
              Analyze a Document
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              className="text-white border-2"
              variant="outline"
              onClick={handleKnowledgeGraph}
            >
              {user ? "Explore Knowledge Graph" : "Contact Support"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
