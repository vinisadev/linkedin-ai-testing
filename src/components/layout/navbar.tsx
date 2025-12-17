"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Home, Users, Briefcase, MessageSquare, Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-white border-b border-linkedin-border-gray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Link href="/feed">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#0a66c2"
                className="w-8 h-8"
              >
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
              </svg>
            </Link>
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-linkedin-text-gray" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="pl-10 pr-4 py-2 bg-linkedin-warm-gray rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:w-80 transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-1 md:gap-6">
            <NavLink href="/feed" icon={Home} label="Home" active={pathname === "/feed"} />
            <NavLink href="/network" icon={Users} label="My Network" active={pathname.startsWith("/network")} />
            <NavLink href="/jobs" icon={Briefcase} label="Jobs" active={pathname.startsWith("/jobs")} />
            <NavLink href="/messaging" icon={MessageSquare} label="Messaging" active={pathname.startsWith("/messaging")} />
            <NavLink href="/notifications" icon={Bell} label="Notifications" active={pathname.startsWith("/notifications")} />

            {session?.user && (
              <div className="relative group">
                <button className="flex flex-col items-center text-linkedin-text-gray hover:text-linkedin-text-dark">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "Profile"}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-linkedin-blue text-white text-xs flex items-center justify-center">
                      {session.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-xs hidden md:block">Me</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-linkedin-border-gray opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-linkedin-text-dark hover:bg-linkedin-warm-gray"
                  >
                    View Profile
                  </Link>
                  <Link
                    href="/profile/edit"
                    className="block px-4 py-2 text-sm text-linkedin-text-dark hover:bg-linkedin-warm-gray"
                  >
                    Settings
                  </Link>
                  <hr className="border-linkedin-border-gray" />
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-linkedin-text-dark hover:bg-linkedin-warm-gray"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-linkedin-text-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-linkedin-warm-gray rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-linkedin-blue"
          />
        </form>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center transition-colors",
        active
          ? "text-linkedin-text-dark"
          : "text-linkedin-text-gray hover:text-linkedin-text-dark"
      )}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs hidden md:block">{label}</span>
      {active && (
        <div className="hidden md:block absolute bottom-0 w-16 h-0.5 bg-linkedin-text-dark" />
      )}
    </Link>
  );
}
