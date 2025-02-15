"use client";
import React, { useState, useEffect } from "react";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [iframeKey, setIframeKey] = useState(Date.now()); // Key to force iframe re-render
  const [iframeLoaded, setIframeLoaded] = useState(false); // Loading state
  const [iframeError, setIframeError] = useState(false); // Error state

  // Reset iframe state when the ID changes
  useEffect(() => {
    setIframeLoaded(false);
    setIframeError(false);
    setIframeKey(Date.now()); // Force iframe to reload
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center">
          {/* Header */}
          <div className="inline-flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 mb-8">
            <span className="text-sm font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Knowledge Graph Visualization
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Knowledge Graph for Conversation <GradientText>{id}</GradientText>
          </h1>

          {/* Iframe Container */}
          <div className="w-full h-[600px] bg-gray-800 rounded-lg border border-gray-700 p-6">
            {/* Loading State */}
            {!iframeLoaded && !iframeError && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Loading visualization...</p>
              </div>
            )}

            {/* Error State */}
            {iframeError && (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-400">
                  Failed to load visualization. Please try again.
                </p>
              </div>
            )}

            {/* Iframe */}
            <iframe
              key={iframeKey} // Force re-render when key changes
              src={`/api/kg/${id}?t=${iframeKey}`} // Cache buster
              className="w-full h-full rounded-lg"
              onLoad={() => {
                console.log("Iframe loaded successfully");
                setIframeLoaded(true);
                setIframeError(false);
              }}
              onError={() => {
                console.error("Iframe failed to load");
                setIframeError(true);
                setIframeLoaded(true); // Hide loading spinner
              }}
              style={{ display: iframeLoaded && !iframeError ? "block" : "none" }}
            />
          </div>

          {/* Back Button */}
          <Button
            size="lg"
            className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 transition-all duration-300"
            onClick={() => router.push("/analyze")}
          >
            Back to Analyze
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}