"use client";

import { useState } from "react";
import { X, Search, Loader2, UserPlus } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  headline: string | null;
}

interface InviteMemberModalProps {
  companyId: string;
  companyName: string;
  onClose: () => void;
  onInvited: () => void;
}

export function InviteMemberModal({
  companyId,
  companyName,
  onClose,
  onInvited,
}: InviteMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "EDITOR">("EDITOR");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&type=people&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.people || []);
      }
    } catch (err) {
      setError("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedUser) return;

    setIsInviting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/companies/${companyId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send invite");
      }

      setSuccess(`Invitation sent to ${selectedUser.name || "user"}`);
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
      onInvited();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-linkedin-border-gray flex items-center justify-between">
          <h2 className="text-lg font-semibold text-linkedin-text-dark">
            Invite to {companyName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-linkedin-warm-gray rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-linkedin-text-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
              Search for a user
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-linkedin-text-gray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-2 border border-linkedin-border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2 bg-linkedin-blue text-white rounded-md hover:bg-linkedin-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && !selectedUser && (
            <div className="border border-linkedin-border-gray rounded-md divide-y divide-linkedin-border-gray max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-linkedin-warm-gray transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-linkedin-blue flex items-center justify-center">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-semibold">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-linkedin-text-dark truncate">
                      {user.name || "LinkedIn User"}
                    </p>
                    {user.headline && (
                      <p className="text-sm text-linkedin-text-gray truncate">
                        {user.headline}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected User */}
          {selectedUser && (
            <div className="border border-linkedin-blue rounded-md p-3 bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-linkedin-blue flex items-center justify-center">
                  {selectedUser.image ? (
                    <img
                      src={selectedUser.image}
                      alt={selectedUser.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-semibold">
                      {selectedUser.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-linkedin-text-dark">
                    {selectedUser.name || "LinkedIn User"}
                  </p>
                  {selectedUser.headline && (
                    <p className="text-sm text-linkedin-text-gray truncate">
                      {selectedUser.headline}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 hover:bg-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-linkedin-text-gray" />
                </button>
              </div>
            </div>
          )}

          {/* Role Selection */}
          {selectedUser && (
            <div>
              <label className="block text-sm font-medium text-linkedin-text-dark mb-2">
                Role
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={selectedRole === "ADMIN"}
                    onChange={() => setSelectedRole("ADMIN")}
                    className="text-linkedin-blue focus:ring-linkedin-blue"
                  />
                  <span className="text-sm text-linkedin-text-dark">
                    Admin (can manage members)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="EDITOR"
                    checked={selectedRole === "EDITOR"}
                    onChange={() => setSelectedRole("EDITOR")}
                    className="text-linkedin-blue focus:ring-linkedin-blue"
                  />
                  <span className="text-sm text-linkedin-text-dark">
                    Editor (can post only)
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-linkedin-border-gray flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-linkedin-text-gray hover:text-linkedin-text-dark transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={!selectedUser || isInviting}
            className="px-4 py-2 bg-linkedin-blue text-white rounded-full hover:bg-linkedin-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isInviting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Send invite
          </button>
        </div>
      </div>
    </div>
  );
}
