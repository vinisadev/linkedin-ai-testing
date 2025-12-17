"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, PenSquare, Loader2 } from "lucide-react";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatView } from "@/components/messaging/chat-view";

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

interface ConversationDetail {
  id: string;
  otherUser: {
    id: string;
    name: string | null;
    image: string | null;
    headline: string | null;
  };
  messages: Message[];
}

function MessagingContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const conversationId = searchParams.get("conversation");
  const userId = searchParams.get("user");

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Fetch single conversation
  const fetchConversation = useCallback(async (id: string) => {
    setIsLoadingChat(true);
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedConversation(data);
        // Refresh conversations to update unread counts
        fetchConversations();
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    } finally {
      setIsLoadingChat(false);
    }
  }, [fetchConversations]);

  // Create or get conversation with a user
  const startConversation = useCallback(async (targetUserId: string) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (response.ok) {
        const conversation = await response.json();
        router.replace(`/messaging?conversation=${conversation.id}`);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [router]);

  // Initial load
  useEffect(() => {
    if (session?.user) {
      fetchConversations();
    }
  }, [session?.user, fetchConversations]);

  // Handle URL params
  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
    } else if (userId) {
      startConversation(userId);
    } else {
      setSelectedConversation(null);
    }
  }, [conversationId, userId, fetchConversation, startConversation]);

  // Poll for new messages when a conversation is selected (without full reload)
  useEffect(() => {
    if (!selectedConversation) return;

    const pollMessages = async () => {
      try {
        const response = await fetch(`/api/conversations/${selectedConversation.id}`);
        if (response.ok) {
          const data = await response.json();
          // Only update messages if there are new ones
          if (data.messages.length !== selectedConversation.messages.length) {
            setSelectedConversation((prev) =>
              prev ? { ...prev, messages: data.messages } : null
            );
            fetchConversations();
          }
        }
      } catch (error) {
        console.error("Failed to poll messages:", error);
      }
    };

    const interval = setInterval(pollMessages, 5000);

    return () => clearInterval(interval);
  }, [selectedConversation?.id, selectedConversation?.messages.length, fetchConversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    router.push(`/messaging?conversation=${conversation.id}`);
  };

  const handleCloseConversation = () => {
    router.push("/messaging");
    setSelectedConversation(null);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(
        `/api/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        const message = await response.json();
        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, message],
              }
            : null
        );
        // Update conversations list
        fetchConversations();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="h-full px-4 py-4">
      <div className="card overflow-hidden h-full max-w-[1400px] mx-auto">
        <div className="flex h-full">
          {/* Conversations sidebar */}
          <div className="w-full md:w-80 lg:w-96 border-r border-linkedin-border-gray flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-linkedin-border-gray flex items-center justify-between">
              <h1 className="text-xl font-semibold text-linkedin-text-dark">
                Messaging
              </h1>
              <button
                onClick={() => router.push("/search?type=people")}
                className="p-2 hover:bg-linkedin-warm-gray rounded-full"
                title="New message"
              >
                <PenSquare className="w-5 h-5 text-linkedin-text-gray" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-linkedin-blue" />
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversation?.id}
                  onSelect={handleSelectConversation}
                  currentUserId={session.user.id}
                />
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="hidden md:flex flex-1 flex-col">
            {selectedConversation ? (
              <ChatView
                conversationId={selectedConversation.id}
                otherUser={selectedConversation.otherUser}
                messages={selectedConversation.messages}
                currentUserId={session.user.id}
                onSendMessage={handleSendMessage}
                onClose={handleCloseConversation}
                isLoading={isLoadingChat}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-linkedin-text-gray">
                <MessageSquare className="w-16 h-16 mb-4" />
                <h2 className="text-xl font-semibold text-linkedin-text-dark">
                  Your messages
                </h2>
                <p className="mt-2 text-center max-w-sm">
                  Select a conversation or start a new one by visiting someone&apos;s
                  profile and clicking &quot;Message&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagingPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full px-4 py-4">
          <div className="card h-full max-w-[1400px] mx-auto flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-linkedin-blue" />
          </div>
        </div>
      }
    >
      <MessagingContent />
    </Suspense>
  );
}
