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
            Transforming BPO Operations with AI
          </h1>
          <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
            At RESOLVR, our mission is to revolutionize BPO operations by leveraging cutting-edge AI technology to enhance efficiency, empower agents, and deliver exceptional customer experiences. We are committed to transforming claims processing workflows into seamless, automated, and scalable solutions.
          </p>
        </div>

        {/* Vision and Impact Section */}
        <div className="grid md:grid-cols-1 gap-12 items-center my-20">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Vision</h2>
            <p className="text-gray-400 leading-relaxed">
              Our vision is to lead the digital transformation of Indian BPOs by setting a new standard for AI integration in claims processing. We envision a future where technology empowers agents, fosters client trust, and delivers unparalleled service quality.
            </p>
            <h3 className="text-2xl font-bold text-white mt-8 mb-4">Impact</h3>
            <p className="text-gray-400 leading-relaxed">
              With RESOLVR, BPOs can achieve a 40% reduction in manual workloads, 30% faster resolution times, and significantly improved customer satisfaction scores. This transformative solution ensures agents like Nisha can handle grievances effectively, without burnout.
            </p>
          </div>
         
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 my-20">
          {[
            { number: "60%", label: "Reduction in Processing Time" },
            { number: "85%", label: "Agent Satisfaction" },
            { number: "40%", label: "Increase in First Call Resolution" },
            { number: "90%", label: "Accurate Sentiment Analysis" },
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
            Our team consists of five passionate innovators who bring together expertise in AI development, customer service workflows, and operational efficiency. United by our vision, we aim to redefine the future of BPO claims processing.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[
              "Vedant Naik",
              "Vivek Nair",
              "Ravirajsingh Sodha",
              "Suyash Konduskar",
              "Nishant Golakiya"
            ].map((member) => (
              <div key={member} className="text-center">
                {/* <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4"></div> */}
                <h3 className="text-white font-semibold">{member}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones Section */}
        <div className="bg-gray-900 rounded-xl p-8 my-20">
          <h2 className="text-2xl font-bold text-white mb-6">Our Journey and Milestones</h2>
          <p className="text-gray-400 mb-4">
            From identifying the inefficiencies in current BPO workflows to designing a robust AI-powered solution, our journey has been fueled by innovation and dedication. RESOLVR represents our commitment to delivering tangible improvements in claims processing efficiency.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Problem Identification</h3>
              <p className="text-gray-400">Recognized the challenges faced by BPO agents in claims processing</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Solution Design</h3>
              <p className="text-gray-400">Developed AI-powered automation for scheduling and sentiment analysis</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Prototype Development</h3>
              <p className="text-gray-400">Created a working prototype of RESOLVR</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Future Goals</h3>
              <p className="text-gray-400">Continuous improvement and expansion of RESOLVR's capabilities</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your BPO Operations?</h2>
          <p className="text-gray-400 mb-8">
            Discover how RESOLVR is reshaping claims processing. Contact us to learn more about our AI-driven solution and explore how it can elevate your BPO operations.
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

