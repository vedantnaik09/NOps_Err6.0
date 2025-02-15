"use client";
import { ChevronDown } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] p-4">
      <div className="mx-auto mt-10 text-white rounded-3xl p-8 relative overflow-hidden">
        {/* Hero Section */}
        <div className="max-w-4xl mb-12">
          <h1 className="text-6xl font-medium leading-tight mb-6">
            Transforming Unstructured PDFs<br />into Actionable Intelligence
          </h1>
          <p className="text-white/60 text-lg mb-8">
            Organizations worldwide are overwhelmed by complex, unstructured data locked within PDFs.
            From legal contracts and financial reports to technical manuals and research papers, the challenge is real.
            Our platform autonomously analyzes and understands documents—detecting hidden patterns and deriving insights.
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex items-center gap-8 mb-20">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#7165E3] rounded-lg hover:bg-[#5B4ED1]">
            Get Started with Document Intelligence
            <span className="w-4 h-4 bg-white/20 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
            </div>
            <span className="text-sm text-white/70">
              Empowering organizations worldwide<br />with advanced document insights.
            </span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* PDF Intelligence Platform */}
          <div className="p-6 bg-white/5 rounded-2xl">
            <h3 className="text-lg font-medium mb-2">PDF Intelligence Platform</h3>
            <p className="text-sm text-white/60 mb-4">
              Autonomously analyze multiple PDFs, detect complex structures like nested tables, diagrams, handwritten notes, 
              and multi-column layouts—with near-human accuracy using advanced OCR.
            </p>
          </div>

          {/* Cognitive Q&A System */}
          <div className="p-6 bg-white/5 rounded-2xl">
            <h3 className="text-lg font-medium mb-2">Cognitive Q&A System</h3>
            <p className="text-sm text-white/60 mb-4">
              Answer multi-layered, context-dependent queries dynamically,
              ensuring accuracy even across follow-up questions.
            </p>
          </div>

          {/* Dynamic Knowledge Graphs */}
          <div className="p-6 bg-white/5 rounded-2xl">
            <h3 className="text-lg font-medium mb-2">Dynamic Knowledge Graphs</h3>
            <p className="text-sm text-white/60 mb-4">
              Generate real-time knowledge graphs to visualize and explore relationships between entities such as people, dates, locations, and concepts.
            </p>
          </div>

          {/* Predictive Insights & Correlation */}
          <div className="p-6 bg-white/5 rounded-2xl">
            <h3 className="text-lg font-medium mb-2">Predictive Insights & Correlation</h3>
            <p className="text-sm text-white/60 mb-4">
              Go beyond static analysis by predicting trends, flagging anomalies, and correlating data across documents to uncover discrepancies and risks.
            </p>
          </div>
        </div>

        {/* Background Effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7165E3] opacity-50 blur-[150px] rounded-full"></div>
      </div>
    </div>
  );
}