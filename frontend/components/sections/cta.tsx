"use client";

import { HeartHandshake, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/ui/gradient-text";

export function CTA() {
  return (
    <section className="relative py-32">
      {/* Background with subtle patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.08),transparent_25%),radial-gradient(circle_at_70%_80%,rgba(192,132,252,0.08),transparent_25%)]" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50 border border-purple-100/20 dark:border-purple-900/20 shadow-2xl shadow-purple-500/5">
          {/* Inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" />
          
          <div className="relative p-8 md:p-16 text-center">
            {/* Icon with animated gradient background */}
            <div className="inline-flex p-4 mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-purple-500/30 animate-pulse">
              <HeartHandshake className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Improve Your{" "}
              <GradientText>Complaint Management?</GradientText>
            </h2>
            
            <p className="text-xl mb-12 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join municipal corporations in delivering efficient, transparent, and AI-powered complaint resolution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-xl mx-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-lg h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto text-lg h-14 border-2 border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-colors duration-300"
              >
                <Phone className="mr-2 h-5 w-5" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
