"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface User {
  name?: string;
  email?: string;
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const currentPath = usePathname();

  // Check user login status when component mounts and whenever the route changes.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optionally, you could decode the token or read additional values.
      // Here we're just reading the userType from localStorage.
      const userType = localStorage.getItem("userType");
      setUser({
        name: userType === "client" ? "Client User" : "Authority User",
      });
    } else {
      setUser(null);
    }
  }, [router, currentPath]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    setUser(null);
    router.push("/");
  };

  // Optionally, to hide the navbar on a specific route (e.g., chat)
  if (currentPath === "/chat") {
    return null;
  }

  return (
    <nav className="w-full fixed p-3 z-20">
      <div className="flex justify-between items-center w-full">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center ml-3">
          <h1 className="font-medium text-xl text-white">CogniSight</h1>
        </Link>

        {/* Center: Navigation links */}
        <div className="flex gap-8">
          <Link href="/" className="text-white/70 hover:text-white">
            Home
          </Link>
          <Link href="/features" className="text-white/70 hover:text-white">
            Features
          </Link>
          <Link href="/about" className="text-white/70 hover:text-white">
            About
          </Link>
          <Link href="/contact" className="text-white/70 hover:text-white">
            Contact
          </Link>
        </div>

        {/* Right: Authentication action */}
        <div className="flex items-center mr-3">
          {user ? (
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 text-white"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth"
              className="px-4 py-2 bg-[#7165E3] rounded-lg hover:bg-[#5B4ED1] text-white"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
