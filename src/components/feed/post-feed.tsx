"use client";

import { PostCard } from "./post-card";

export function PostFeed() {
  // TODO: Fetch posts from API
  const posts: any[] = [];

  if (posts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-linkedin-text-gray">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
