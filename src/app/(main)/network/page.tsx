"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Users, UserPlus, UserCheck } from "lucide-react";
import { UserCard } from "@/components/search/user-card";
import { ConnectionsList } from "@/components/network/connections-list";

interface SuggestedUser {
  id: string;
  name: string | null;
  image: string | null;
  headline: string | null;
  location: string | null;
  totalConnections: number;
  connectionStatus: {
    id: string;
    status: string;
    isReceiver: boolean;
  } | null;
  profile?: {
    experiences?: {
      title: string;
      company: string;
    }[];
  } | null;
}

interface Connection {
  id: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    headline: string | null;
  };
}

export default function NetworkPage() {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await fetch("/api/search/suggestions");
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const fetchConnections = useCallback(async () => {
    try {
      const response = await fetch("/api/connections?status=ACCEPTED");
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      }
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setIsLoadingConnections(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
    fetchConnections();
  }, [fetchSuggestions, fetchConnections]);

  const handleRemoveConnection = (connectionId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-linkedin-blue" />
          <h1 className="text-xl font-semibold text-linkedin-text-dark">
            My Network
          </h1>
        </div>
      </div>

      {/* People You May Know */}
      <div className="card">
        <div className="p-4 border-b border-linkedin-border-gray">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-linkedin-text-gray" />
            <h2 className="font-semibold text-linkedin-text-dark">
              People you may know
            </h2>
          </div>
          <p className="text-sm text-linkedin-text-gray mt-1">
            Based on your profile and connections
          </p>
        </div>

        <div className="p-4">
          {isLoadingSuggestions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-linkedin-blue" />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {suggestions.map((user) => (
                <SuggestionCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-linkedin-border-gray mx-auto mb-4" />
              <p className="text-linkedin-text-dark font-medium mb-1">
                No suggestions yet
              </p>
              <p className="text-linkedin-text-gray text-sm">
                Complete your profile to get personalized suggestions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* My Connections */}
      <div className="card">
        <div className="p-4 border-b border-linkedin-border-gray">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-linkedin-text-gray" />
              <h2 className="font-semibold text-linkedin-text-dark">
                Connections
              </h2>
              {!isLoadingConnections && (
                <span className="text-sm text-linkedin-text-gray">
                  ({connections.length})
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-linkedin-text-gray mt-1">
            People in your network
          </p>
        </div>

        <div>
          {isLoadingConnections ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-linkedin-blue" />
            </div>
          ) : (
            <ConnectionsList
              connections={connections}
              onRemoveConnection={handleRemoveConnection}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({ user }: { user: SuggestedUser }) {
  return (
    <UserCard
      user={{
        ...user,
        connectionStatus: user.connectionStatus,
      }}
    />
  );
}
