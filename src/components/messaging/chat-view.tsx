"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface OtherUser {
  id: string;
  name: string | null;
  image: string | null;
  headline: string | null;
}

interface ChatViewProps {
  conversationId: string;
  otherUser: OtherUser;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function ChatView({
  conversationId,
  otherUser,
  messages,
  currentUserId,
  onSendMessage,
  onClose,
  isLoading,
}: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-linkedin-blue" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-linkedin-border-gray flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-linkedin-blue text-white flex items-center justify-center overflow-hidden">
          {otherUser.image ? (
            <img
              src={otherUser.image}
              alt={otherUser.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{otherUser.name?.[0]?.toUpperCase() || "U"}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-linkedin-text-dark truncate">
            {otherUser.name || "Unknown User"}
          </h2>
          {otherUser.headline && (
            <p className="text-sm text-linkedin-text-gray truncate">
              {otherUser.headline}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-linkedin-warm-gray rounded-full transition-colors"
          title="Close conversation"
        >
          <X className="w-5 h-5 text-linkedin-text-gray" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-linkedin-text-gray py-8">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const showAvatar =
              index === 0 || messages[index - 1].senderId !== message.senderId;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  isOwn ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className="w-8 h-8 flex-shrink-0">
                  {showAvatar && !isOwn && (
                    <div className="w-8 h-8 rounded-full bg-linkedin-blue text-white text-sm flex items-center justify-center overflow-hidden">
                      {message.sender.image ? (
                        <img
                          src={message.sender.image}
                          alt={message.sender.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        message.sender.name?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2",
                    isOwn
                      ? "bg-linkedin-blue text-white rounded-br-sm"
                      : "bg-linkedin-warm-gray text-linkedin-text-dark rounded-bl-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isOwn ? "text-blue-100" : "text-linkedin-text-gray"
                    )}
                  >
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-linkedin-border-gray"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 px-4 py-2 border border-linkedin-border-gray rounded-full focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-2 bg-linkedin-blue text-white rounded-full hover:bg-linkedin-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
