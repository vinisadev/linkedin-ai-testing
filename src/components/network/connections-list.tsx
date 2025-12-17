"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, MoreHorizontal, UserMinus } from "lucide-react";
import { useState } from "react";

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

interface ConnectionsListProps {
  connections: Connection[];
  onRemoveConnection?: (connectionId: string) => void;
}

export function ConnectionsList({
  connections,
  onRemoveConnection,
}: ConnectionsListProps) {
  if (connections.length === 0) {
    return (
      <div className="text-center py-8 text-linkedin-text-gray">
        <p>You don&apos;t have any connections yet.</p>
        <p className="text-sm mt-1">
          Start connecting with people you know!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-linkedin-border-gray">
      {connections.map((connection) => (
        <ConnectionItem
          key={connection.id}
          connection={connection}
          onRemove={onRemoveConnection}
        />
      ))}
    </div>
  );
}

function ConnectionItem({
  connection,
  onRemove,
}: {
  connection: Connection;
  onRemove?: (connectionId: string) => void;
}) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleMessage = () => {
    router.push(`/messaging?user=${connection.user.id}`);
  };

  const handleRemove = async () => {
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      const response = await fetch(`/api/connections/${connection.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        onRemove?.(connection.id);
      }
    } catch (error) {
      console.error("Failed to remove connection:", error);
    } finally {
      setIsRemoving(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-linkedin-warm-gray/50 transition-colors">
      {/* Avatar */}
      <Link href={`/profile/${connection.user.id}`} className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-linkedin-blue">
          {connection.user.image ? (
            <img
              src={connection.user.image}
              alt={connection.user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold">
              {connection.user.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/profile/${connection.user.id}`}
          className="font-semibold text-linkedin-text-dark hover:underline hover:text-linkedin-blue"
        >
          {connection.user.name || "LinkedIn User"}
        </Link>
        {connection.user.headline && (
          <p className="text-sm text-linkedin-text-gray line-clamp-1">
            {connection.user.headline}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleMessage}
          className="p-2 text-linkedin-text-gray hover:text-linkedin-blue hover:bg-linkedin-warm-gray rounded-full transition-colors"
          title="Message"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-linkedin-text-gray hover:text-linkedin-text-dark hover:bg-linkedin-warm-gray rounded-full transition-colors"
            title="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-linkedin-border-gray z-20">
                <button
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-linkedin-warm-gray disabled:opacity-50"
                >
                  <UserMinus className="w-4 h-4" />
                  {isRemoving ? "Removing..." : "Remove connection"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
