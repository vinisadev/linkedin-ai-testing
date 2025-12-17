"use client";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  lastMessageAt: Date;
  otherUser: {
    id: string;
    name: string | null;
    image: string | null;
    headline: string | null;
  } | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  currentUserId: string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  currentUserId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-linkedin-text-gray">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">
          Start a conversation by visiting someone&apos;s profile
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-linkedin-border-gray">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation)}
          className={cn(
            "w-full p-4 text-left hover:bg-linkedin-warm-gray transition-colors",
            selectedId === conversation.id && "bg-linkedin-warm-gray"
          )}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-linkedin-blue text-white flex items-center justify-center flex-shrink-0 overflow-hidden">
              {conversation.otherUser?.image ? (
                <img
                  src={conversation.otherUser.image}
                  alt={conversation.otherUser.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">
                  {conversation.otherUser?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3
                  className={cn(
                    "font-medium truncate",
                    conversation.unreadCount > 0
                      ? "text-linkedin-text-dark font-semibold"
                      : "text-linkedin-text-dark"
                  )}
                >
                  {conversation.otherUser?.name || "Unknown User"}
                </h3>
                {conversation.lastMessage && (
                  <span className="text-xs text-linkedin-text-gray flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                      addSuffix: false,
                    })}
                  </span>
                )}
              </div>

              {conversation.lastMessage && (
                <p
                  className={cn(
                    "text-sm truncate mt-0.5",
                    conversation.unreadCount > 0
                      ? "text-linkedin-text-dark font-medium"
                      : "text-linkedin-text-gray"
                  )}
                >
                  {conversation.lastMessage.senderId === currentUserId && (
                    <span className="text-linkedin-text-gray">You: </span>
                  )}
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>

            {/* Unread indicator */}
            {conversation.unreadCount > 0 && (
              <div className="w-5 h-5 bg-linkedin-blue text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
