import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, Clock, Heart, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="bg-black min-h-screen">
      <div className="container px-4 py-24 mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Unlocking Hidden Insights in Your Documents
          </h1>
          <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
            At CogniSight, we transform unstructured PDFs into dynamic, actionable intelligence. Our pioneering AI-driven solutions analyze complex document data, uncover hidden patterns, and empower organizations to make informed decisions faster.
          </p>
        </div>

        {/* Vision and Impact Section */}
        <div className="grid md:grid-cols-1 gap-12 items-center my-20">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Vision</h2>
            <p className="text-gray-400 leading-relaxed">
              We envision a world where every document holds actionable insights. By leveraging state-of-the-art OCR and AI technologies, our platform unlocks the full potential of unstructured data, making intelligence accessible and valuable for every organization.
            </p>
            <h3 className="text-2xl font-bold text-white mt-8 mb-4">The Impact</h3>
            <p className="text-gray-400 leading-relaxed">
              CogniSight drives efficiency and precision by reducing manual intervention, accelerating data extraction, and providing accurate, real-time insights. Our solutions empower teams to focus on strategy and innovation while we handle the heavy lifting of document processing.
            </p>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 my-20">
          {[
            { number: "60%", label: "Faster Data Extraction" },
            { number: "85%", label: "Accuracy in Recognition" },
            { number: "40%", label: "Reduction in Manual Work" },
            { number: "90%", label: "Actionable Insights" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-purple-500 mb-2">{stat.number}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="my-20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Our Team</h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Our diverse team of experts in AI, document processing, and data analytics is dedicated to redefining how organizations harness the power of unstructured data.
          </p>
        </div>

        {/* Milestones Section */}
        <div className="bg-gray-900 rounded-xl p-8 my-20">
          <h2 className="text-2xl font-bold text-white mb-6">Our Journey & Milestones</h2>
          <p className="text-gray-400 mb-4">
            From developing advanced OCR algorithms to creating dynamic knowledge graphs, our journey has been driven by innovation and a passion for excellence in document intelligence.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Research & Innovation</h3>
              <p className="text-gray-400">Pioneering AI methodologies to transform document analysis.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Prototype Development</h3>
              <p className="text-gray-400">Built a robust platform that autonomously processes and analyzes PDFs.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Integration & Scaling</h3>
              <p className="text-gray-400">Scaled our solution to ingest and interpret large volumes of unstructured data.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Continuous Improvement</h3>
              <p className="text-gray-400">Regular updates and enhancements to maintain state-of-the-art accuracy and efficiency.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Unlock Document Intelligence?</h2>
          <p className="text-gray-400 mb-8">
            Discover how CogniSight is revolutionizing the way organizations transform unstructured PDFs into actionable insights.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline">Contact Us</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

