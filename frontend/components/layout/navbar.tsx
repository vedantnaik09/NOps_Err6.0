"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, LogIn, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface User {
  name?: string;
  email?: string;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const updateUser = () => {
      const token = localStorage.getItem('token');
      if (token) {
        const userType = localStorage.getItem('userType');
        setUser({
          name: userType === 'client' ? 'Client User' : 'Authority User',
        });
      } else {
        setUser(null);
      }
    };

    window.addEventListener("scroll", handleScroll);
    updateUser(); // Check user on component mount

    // Listen to localStorage changes for dynamic updates
    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setUser(null);
    router.push('/');
  };

  if (currentPath === "/chat") {
    return null; // Don't render the navbar if the path is "/auth"
  }

  return (
    <nav className="w-full fixed p-3 z-20">
      <div className="flex justify-between items-center w-full ">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center ml-3">
          <h1 className="font-medium text-xl">CogniSight</h1>
        </Link>
        {/* Center: Navigation links */}
        <div className="flex gap-8">
          <Link href="/" className="text-white/70 hover:text-white">Home</Link>
          <Link href="/features" className="text-white/70 hover:text-white">Features</Link>
          <Link href="/about" className="text-white/70 hover:text-white">About</Link>
          <Link href="/contact" className="text-white/70 hover:text-white">Contact</Link>
        </div>
        {/* Right: Account action */}
        <div className="flex items-center mr-3">
          <Link href="/auth" className="px-4 py-2 bg-[#7165E3] rounded-lg hover:bg-[#5B4ED1] text-white">
            Create account
          </Link>
        </div>
      </div>
    </nav>
  );
}
