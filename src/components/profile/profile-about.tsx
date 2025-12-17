"use client";

import { useState } from "react";
import { Pencil, ChevronDown, ChevronUp } from "lucide-react";

interface ProfileAboutProps {
  about: string;
  isOwnProfile: boolean;
}

export function ProfileAbout({ about, isOwnProfile }: ProfileAboutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = about.length > 300;
  const displayText = shouldTruncate && !isExpanded ? about.slice(0, 300) + "..." : about;

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-linkedin-text-dark">About</h2>
        {isOwnProfile && (
          <button className="p-2 hover:bg-linkedin-warm-gray rounded-full">
            <Pencil className="w-5 h-5 text-linkedin-text-gray" />
          </button>
        )}
      </div>

      <p className="text-linkedin-text-dark whitespace-pre-wrap">{displayText}</p>

      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-linkedin-text-gray hover:text-linkedin-text-dark mt-2 font-medium"
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </section>
  );
}
