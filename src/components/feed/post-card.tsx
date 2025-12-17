"use client";

import { ThumbsUp, MessageCircle, Repeat2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      name: string;
      headline?: string;
      image?: string | null;
    };
    _count: {
      likes: number;
      comments: number;
    };
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="card">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-linkedin-blue text-white text-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              post.author.name[0].toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-linkedin-text-dark">{post.author.name}</h3>
            {post.author.headline && (
              <p className="text-sm text-linkedin-text-gray truncate">{post.author.headline}</p>
            )}
            <p className="text-xs text-linkedin-text-gray">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <p className="mt-4 text-linkedin-text-dark whitespace-pre-wrap">{post.content}</p>
      </div>

      {(post._count.likes > 0 || post._count.comments > 0) && (
        <div className="px-4 py-2 flex items-center gap-4 text-sm text-linkedin-text-gray border-t border-linkedin-border-gray">
          {post._count.likes > 0 && <span>{post._count.likes} likes</span>}
          {post._count.comments > 0 && <span>{post._count.comments} comments</span>}
        </div>
      )}

      <div className="px-4 py-1 flex items-center justify-around border-t border-linkedin-border-gray">
        <ActionButton icon={ThumbsUp} label="Like" />
        <ActionButton icon={MessageCircle} label="Comment" />
        <ActionButton icon={Repeat2} label="Repost" />
        <ActionButton icon={Send} label="Send" />
      </div>
    </article>
  );
}

function ActionButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="flex items-center gap-2 px-3 py-3 rounded-md hover:bg-linkedin-warm-gray text-linkedin-text-gray">
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium hidden sm:inline">{label}</span>
    </button>
  );
}
