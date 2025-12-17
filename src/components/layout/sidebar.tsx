"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bookmark } from "lucide-react";

export function Sidebar() {
  const { data: session } = useSession();

  return (
    <div className="card overflow-hidden">
      <div className="h-14 bg-gradient-to-r from-linkedin-blue to-linkedin-light-blue" />
      <div className="px-4 pb-4">
        <div className="-mt-8 mb-4">
          <div className="w-16 h-16 rounded-full bg-white border-2 border-white overflow-hidden">
            <div className="w-full h-full bg-linkedin-blue text-white text-2xl flex items-center justify-center">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
        <Link href="/profile" className="font-semibold text-linkedin-text-dark hover:underline">
          {session?.user?.name || "Your Name"}
        </Link>
        <p className="text-sm text-linkedin-text-gray mt-1">
          Add a headline to tell people about yourself
        </p>
      </div>
      <div className="border-t border-linkedin-border-gray px-4 py-3">
        <Link
          href="/network"
          className="flex justify-between text-sm text-linkedin-text-gray hover:text-linkedin-text-dark"
        >
          <span>Connections</span>
          <span className="text-linkedin-blue font-semibold">0</span>
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
