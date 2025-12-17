"use client";

import { useState } from "react";
import { Building2, Image, Loader2 } from "lucide-react";

interface CreateCompanyPostProps {
  companyId: string;
  companyName: string;
  companyLogo: string | null;
  onPostCreated?: () => void;
}

export function CreateCompanyPost({
  companyId,
  companyName,
  companyLogo,
  onPostCreated,
}: CreateCompanyPostProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const response = await fetch(`/api/companies/${companyId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (response.ok) {
        setContent("");
        onPostCreated?.();
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="card p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-lg bg-white border border-linkedin-border-gray flex items-center justify-center overflow-hidden flex-shrink-0">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6 text-linkedin-text-gray" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-linkedin-text-gray mb-1">
              Posting as <span className="font-medium text-linkedin-text-dark">{companyName}</span>
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share an update..."
              rows={3}
              className="w-full px-3 py-2 border border-linkedin-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent resize-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-linkedin-border-gray">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-linkedin-text-gray hover:bg-linkedin-warm-gray rounded-md transition-colors"
          >
            <Image className="w-5 h-5" />
            <span className="text-sm">Photo</span>
          </button>
          <button
            type="submit"
            disabled={!content.trim() || isPosting}
            className="px-4 py-1.5 bg-linkedin-blue text-white text-sm font-medium rounded-full hover:bg-linkedin-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isPosting && <Loader2 className="w-4 h-4 animate-spin" />}
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
