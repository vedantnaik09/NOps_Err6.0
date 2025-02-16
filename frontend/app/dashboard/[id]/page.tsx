"use client";
import React, { useState, useEffect } from "react";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { openDB, getFromDB } from "@/utils/indexedDB";

interface ImageData {
  filename: string;
  base64: string;
}

interface ConversationDetails {
  messages: any[];
  pdf_files: string[];
  title: string;
  created_at: string;
  updated_at: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [iframeKey, setIframeKey] = useState(Date.now()); // Key to force iframe re-render
  const [iframeLoaded, setIframeLoaded] = useState(false); // Loading state
  const [iframeError, setIframeError] = useState(false); // Error state
  const [images, setImages] = useState<ImageData[]>([]); // State to store images
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null); // State to store conversation details

  // Fetch images from IndexedDB
  const fetchImagesFromIndexedDB = async (conversationId: string): Promise<any[]> => {
    try {
      const db = await openDB("ChatbotDB", "analysisData");
      const data = await getFromDB(db, "analysisData", `analysisData_${conversationId}`);
      return data?.images ?? [];
    } catch (error) {
      console.error("Error fetching images from IndexedDB:", error);
      throw error;
    }
  };

  // Fetch conversation details from the backend
  const fetchConversationDetails = async (conversationId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/chat/${conversationId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch conversation details");
      }
      const data: ConversationDetails = await response.json();
      setConversationDetails(data);
    } catch (error) {
      console.error("Error fetching conversation details:", error);
    }
  };

  // Reset iframe state and fetch images and conversation details when the ID changes
  useEffect(() => {
    setIframeLoaded(false);
    setIframeError(false);
    setIframeKey(Date.now());

    const fetchData = async () => {
      try {
        const imgs = await fetchImagesFromIndexedDB(id);
        setImages(imgs);
        await fetchConversationDetails(id);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [id]);

  function formatFileName(filename: string): string {
    // Remove the file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    // Split on underscores and capitalize each word
    return nameWithoutExt
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

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
          <h1 className="text-4xl md:text-3xl font-bold tracking-tight mb-8">
            Knowledge Graph for Conversation{" "}
            <h3 className="text-3xl mt-2 font-light">
              <GradientText>{conversationDetails?.title}</GradientText>
            </h3>
          </h1>

          {/* Flex container for both Iframe and Images */}
          <div className="flex flex-wrap justify-center gap-8 w-full">
            {/* Iframe Container */}
            <div className="w-full sm:w-[45%] h-[650px] bg-gray-800 rounded-lg border border-gray-700 p-6">
              {/* Heading */}
              <h2 className="text-xl font-semibold mb-4">Knowledge Graph</h2>
              <div className="relative w-full h-full">
                {!iframeLoaded && !iframeError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-400">Loading visualization...</p>
                  </div>
                )}
                {iframeError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-red-400">Failed to load visualization. Please try again.</p>
                  </div>
                )}
                <iframe
                  key={iframeKey}
                  src={`/api/kg/${id}?t=${iframeKey}`}
                  className="w-full h-[90%] rounded-lg"
                  onLoad={() => {
                    console.log("Iframe loaded successfully");
                    setIframeLoaded(true);
                    setIframeError(false);
                  }}
                  onError={() => {
                    console.error("Iframe failed to load");
                    setIframeError(true);
                    setIframeLoaded(true);
                  }}
                  style={{ display: iframeLoaded && !iframeError ? "block" : "none" }}
                />
              </div>
            </div>

            {/* Render each image in the same flex container */}
            {images.map((image, index) => (
              <div
                key={index}
                className="w-full sm:w-[45%] h-[650px] bg-gray-800 rounded-lg border border-gray-700 p-6 flex flex-col justify-center items-center"
              >
                <h2 className="text-xl font-semibold mb-4">{formatFileName(image.filename)}</h2>
                <img src={`data:image/jpeg;base64,${image.base64}`} alt={image.filename} className="object-cover w-fit rounded-lg" />
              </div>
            ))}
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
