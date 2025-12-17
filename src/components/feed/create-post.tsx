"use client";

import { useSession } from "next-auth/react";
import { Image, FileText, Calendar, Newspaper } from "lucide-react";

export function CreatePost() {
  const { data: session } = useSession();

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-linkedin-blue text-white text-lg flex items-center justify-center flex-shrink-0">
          {session?.user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <button className="flex-1 text-left px-4 py-3 border border-linkedin-border-gray rounded-full text-linkedin-text-gray hover:bg-linkedin-warm-gray transition-colors">
          Start a post
        </button>
      </div>
      <div className="flex items-center justify-around mt-4 pt-2">
        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-linkedin-warm-gray text-linkedin-text-gray">
          <Image className="w-5 h-5 text-linkedin-blue" />
          <span className="text-sm font-medium">Media</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-linkedin-warm-gray text-linkedin-text-gray">
          <Calendar className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium">Event</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-linkedin-warm-gray text-linkedin-text-gray">
          <Newspaper className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium">Article</span>
        </button>
      </div>
    </div>
  );
}
