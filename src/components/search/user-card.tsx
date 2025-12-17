"use client";

import Link from "next/link";
import { ConnectionButton } from "@/components/profile/connection-button";

interface UserCardProps {
  user: {
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
  };
  showMutualConnections?: boolean;
}

export function UserCard({ user, showMutualConnections: _showMutualConnections = false }: UserCardProps) {
  const currentPosition = user.profile?.experiences?.[0];

  return (
    <div className="flex gap-4 p-4 border border-linkedin-border-gray rounded-lg hover:bg-linkedin-warm-gray/50 transition-colors">
      {/* Avatar */}
      <Link href={`/profile/${user.id}`} className="flex-shrink-0">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-linkedin-blue">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-xl font-semibold">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/profile/${user.id}`}
          className="font-semibold text-linkedin-text-dark hover:underline hover:text-linkedin-blue"
        >
          {user.name || "LinkedIn User"}
        </Link>

        {user.headline && (
          <p className="text-sm text-linkedin-text-dark line-clamp-1">
            {user.headline}
          </p>
        )}

        {currentPosition && (
          <p className="text-sm text-linkedin-text-gray line-clamp-1">
            {currentPosition.title} at {currentPosition.company}
          </p>
        )}

        {user.location && (
          <p className="text-sm text-linkedin-text-gray">{user.location}</p>
        )}

        <p className="text-sm text-linkedin-text-gray mt-1">
          {user.totalConnections} connection{user.totalConnections !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Action */}
      <div className="flex-shrink-0 self-center">
        <ConnectionButton
          userId={user.id}
          connectionStatus={user.connectionStatus}
        />
      </div>
    </div>
  );
}
