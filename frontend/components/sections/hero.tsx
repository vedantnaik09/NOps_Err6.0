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
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (token) {
      setUser({
        name: userType === 'client' ? 'Client User' : 'Authority User',
      });
    }
  }, []);

  const handleReportComplaint = () => {
    if (user) {
      // Redirect to the complaint submission page if logged in
      router.push("/submitComplaint");
    } else {
      // Redirect to the login page if not logged in
      router.push("/auth");
    }
  };

  const handleButtonClick = () => {
    if (user) {
      // If user is logged in, redirect to complaint history page
      router.push("/viewComplaint");
    } else {
      // If user is not logged in, redirect to contact support
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
              AI-Powered Complaint Management
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            Revolutionize Public Service with{" "}
            <GradientText>Efficient Complaint Resolution</GradientText>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
            Our Complaint Management System streamlines the process of handling public grievances, ensuring fast and effective resolutions to improve the community's experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
              onClick={handleReportComplaint}
            >
              Report a Complaint
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              className="text-white border-2"
              variant="outline"
              onClick={handleButtonClick}
            >
              {user ? "View Complaint History" : "Contact Support"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-16 p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-purple-100/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">Trusted by Municipal Corporations Nationwide</p>
            <div className="mt-4 flex justify-center gap-8">
              {/* Add logos or relevant images of municipal corporations */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
