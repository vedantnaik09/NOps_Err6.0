"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  user_type?: string;
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();

  // Check user login status when component mounts and whenever the route changes.
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      setUser(parsedUserData);
    } else {
      setUser(null);
    }
  }, [router, currentPath]);

  const handleSignOut = () => {
    localStorage.removeItem("userData");
    setUser(null);
    setShowDropdown(false);
    router.push("/");
  };

  // Restrict access to certain pages if the user is not logged in
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData && (currentPath === "/chat" || currentPath === "/dashboard")) {
      router.push("/");
    }
  }, [currentPath, router]);

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
          {user ? (
            <>
              <Link href="/chat" className="text-white/70 hover:text-white">
                Chat
              </Link>
              <Link href="/dashboard" className="text-white/70 hover:text-white">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/about" className="text-white/70 hover:text-white">
                About
              </Link>
              <Link href="/contact" className="text-white/70 hover:text-white">
                Contact
              </Link>
            </>
          )}
        </div>

        {/* Right: Authentication action */}
        <div className="flex items-center mr-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-4 py-2 bg-[#7165E3] rounded-lg hover:bg-[#5B4ED1] text-white"
              >
                {user.name}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 rounded-md shadow-lg bg-[#2d2d2d] ring-1 ring-[#444]">
                  <div className="py-1">
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 text-sm text-white"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
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