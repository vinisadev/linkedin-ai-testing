"use client";

import { useState } from "react";
import { X, Loader2, Crown, AlertTriangle } from "lucide-react";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    headline: string | null;
  };
}

interface TransferOwnershipModalProps {
  companyId: string;
  companyName: string;
  members: Member[];
  onClose: () => void;
  onTransferred: () => void;
}

export function TransferOwnershipModal({
  companyId,
  companyName,
  members,
  onClose,
  onTransferred,
}: TransferOwnershipModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState("");

  const handleTransfer = async () => {
    if (!selectedUserId) return;

    if (
      !confirm(
        `Are you sure you want to transfer ownership of "${companyName}"? You will become an admin and cannot undo this action.`
      )
    )
      return;

    setIsTransferring(true);
    setError("");

    try {
      const response = await fetch(
        `/api/companies/${companyId}/transfer-ownership`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newOwnerId: selectedUserId }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to transfer ownership");
      }

      onTransferred();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transfer ownership");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-linkedin-border-gray flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-linkedin-text-dark">
              Transfer ownership
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-linkedin-warm-gray rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-linkedin-text-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Warning */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">This action cannot be undone</p>
              <p>
                Once you transfer ownership, you will become an admin and the new
                owner will have full control over the page.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-linkedin-text-dark mb-2">
              Select new owner
            </label>
            {members.length === 0 ? (
              <p className="text-sm text-linkedin-text-gray">
                No other members to transfer ownership to. Invite members first.
              </p>
            ) : (
              <div className="border border-linkedin-border-gray rounded-md divide-y divide-linkedin-border-gray max-h-64 overflow-y-auto">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      selectedUserId === member.user.id
                        ? "bg-blue-50"
                        : "hover:bg-linkedin-warm-gray"
                    }`}
                  >
                    <input
                      type="radio"
                      name="newOwner"
                      value={member.user.id}
                      checked={selectedUserId === member.user.id}
                      onChange={() => setSelectedUserId(member.user.id)}
                      className="text-linkedin-blue focus:ring-linkedin-blue"
                    />
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-linkedin-blue flex items-center justify-center">
                      {member.user.image ? (
                        <img
                          src={member.user.image}
                          alt={member.user.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-semibold">
                          {member.user.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-linkedin-text-dark">
                        {member.user.name || "LinkedIn User"}
                      </p>
                      <p className="text-sm text-linkedin-text-gray capitalize">
                        Current role: {member.role.toLowerCase()}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
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
            onClick={handleTransfer}
            disabled={!selectedUserId || isTransferring || members.length === 0}
            className="px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isTransferring ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crown className="w-4 h-4" />
            )}
            Transfer ownership
          </button>
        </div>
      </div>
    </div>
  );
}
