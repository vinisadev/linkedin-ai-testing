import { CreatePost } from "@/components/feed/create-post";
import { PostFeed } from "@/components/feed/post-feed";

export default function FeedPage() {
  return (
    <div className="space-y-4">
      <CreatePost />
      <PostFeed />
    </div>
  );
}
