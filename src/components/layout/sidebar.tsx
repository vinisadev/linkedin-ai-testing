"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bookmark, Building2 } from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  image: string | null;
  headline: string | null;
  totalConnections: number;
}

export function Sidebar() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session?.user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/me");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="h-14 bg-gradient-to-r from-linkedin-blue to-linkedin-light-blue" />
      <div className="px-4 pb-4">
        <div className="-mt-8 mb-4">
          <Link href="/profile" className="block w-16 h-16 rounded-full bg-white border-2 border-white overflow-hidden">
            {profile?.image ? (
              <img
                src={profile.image}
                alt={profile.name || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linkedin-blue text-white text-2xl flex items-center justify-center">
                {profile?.name?.[0]?.toUpperCase() || session?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </Link>
        </div>
        <Link href="/profile" className="font-semibold text-linkedin-text-dark hover:underline">
          {profile?.name || session?.user?.name || "Your Name"}
        </Link>
        <p className="text-sm text-linkedin-text-gray mt-1 line-clamp-2">
          {profile?.headline || "Add a headline to tell people about yourself"}
        </p>
      </div>
      <div className="border-t border-linkedin-border-gray px-4 py-3">
        <Link
          href="/network"
          className="flex justify-between text-sm text-linkedin-text-gray hover:text-linkedin-text-dark"
        >
          <span>Connections</span>
          <span className="text-linkedin-blue font-semibold">
            {isLoading ? "-" : profile?.totalConnections || 0}
          </span>
        </Link>
      </div>
      <div className="border-t border-linkedin-border-gray px-4 py-3">
        <Link
          href="/companies"
          className="flex items-center gap-2 text-sm text-linkedin-text-gray hover:text-linkedin-text-dark"
        >
          <Building2 className="w-4 h-4" />
          <span>Company pages</span>
        </Link>
      </div>
      <div className="border-t border-linkedin-border-gray px-4 py-3">
        <Link
          href="/saved"
          className="flex items-center gap-2 text-sm text-linkedin-text-gray hover:text-linkedin-text-dark"
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved items</span>
        </Link>
      </div>
    </div>
  );
}
