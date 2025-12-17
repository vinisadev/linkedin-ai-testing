"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Building2, MessageCircle, ThumbsUp, Loader2 } from "lucide-react";

interface CompanyPost {
  id: string;
  content: string;
  image: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
  isLiked: boolean;
}

interface CompanyPostFeedProps {
  companyId: string;
  refreshKey?: number;
}

export function CompanyPostFeed({ companyId, refreshKey }: CompanyPostFeedProps) {
  const [posts, setPosts] = useState<CompanyPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = useCallback(async (cursor?: string) => {
    try {
      const url = new URL(`/api/companies/${companyId}/posts`, window.location.origin);
      if (cursor) url.searchParams.set("cursor", cursor);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        if (cursor) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }
        setNextCursor(data.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [companyId]);

  useEffect(() => {
    setIsLoading(true);
    fetchPosts();
  }, [fetchPosts, refreshKey]);

  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchPosts(nextCursor);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !isLiked,
              _count: {
                ...post._count,
                likes: post._count.likes + (isLiked ? -1 : 1),
              },
            }
          : post
      )
    );

    try {
      await fetch(`/api/companies/${companyId}/posts/${postId}/like`, {
        method: isLiked ? "DELETE" : "POST",
      });
    } catch (error) {
      // Revert on error
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: isLiked,
                _count: {
                  ...post._count,
                  likes: post._count.likes + (isLiked ? 1 : -1),
                },
              }
            : post
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="card p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-linkedin-blue" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Building2 className="w-12 h-12 text-linkedin-border-gray mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-linkedin-text-dark mb-2">
          No posts yet
        </h3>
        <p className="text-linkedin-text-gray">
          Be the first to share an update from this company.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="card">
          {/* Post Header */}
          <div className="p-4 pb-0">
            <Link
              href={`/company/${post.company.slug}`}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-white border border-linkedin-border-gray flex items-center justify-center overflow-hidden">
                {post.company.logo ? (
                  <img
                    src={post.company.logo}
                    alt={post.company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-linkedin-text-gray" />
                )}
              </div>
              <div>
                <p className="font-semibold text-linkedin-text-dark hover:text-linkedin-blue hover:underline">
                  {post.company.name}
                </p>
                <p className="text-xs text-linkedin-text-gray">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </Link>
          </div>

          {/* Post Content */}
          <div className="p-4">
            <p className="text-linkedin-text-dark whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Post Image */}
          {post.image && (
            <div className="border-t border-b border-linkedin-border-gray">
              <img
                src={post.image}
                alt=""
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Stats */}
          {(post._count.likes > 0 || post._count.comments > 0) && (
            <div className="px-4 py-2 flex items-center justify-between text-sm text-linkedin-text-gray border-b border-linkedin-border-gray">
              {post._count.likes > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 bg-linkedin-blue rounded-full flex items-center justify-center">
                    <ThumbsUp className="w-2.5 h-2.5 text-white" />
                  </span>
                  {post._count.likes}
                </span>
              )}
              {post._count.comments > 0 && (
                <span>
                  {post._count.comments} comment
                  {post._count.comments !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-2 flex items-center">
            <button
              onClick={() => handleLike(post.id, post.isLiked)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
                post.isLiked
                  ? "text-linkedin-blue"
                  : "text-linkedin-text-gray hover:bg-linkedin-warm-gray"
              }`}
            >
              <ThumbsUp
                className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`}
              />
              <span className="text-sm font-medium">Like</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-linkedin-text-gray hover:bg-linkedin-warm-gray rounded-md transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Comment</span>
            </button>
          </div>
        </div>
      ))}

      {/* Load More */}
      {nextCursor && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 text-linkedin-blue hover:bg-linkedin-warm-gray rounded-md transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Load more posts"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
