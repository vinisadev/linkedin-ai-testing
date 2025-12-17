"use client";

import { useState } from "react";
import { UserPlus, Check, Clock, X, Loader2 } from "lucide-react";

interface ConnectionButtonProps {
  userId: string;
  connectionStatus: {
    id: string;
    status: string;
    isReceiver: boolean;
  } | null;
}

export function ConnectionButton({ userId, connectionStatus }: ConnectionButtonProps) {
  const [status, setStatus] = useState(connectionStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          id: data.id,
          status: "PENDING",
          isReceiver: false,
        });
      }
    } catch (error) {
      console.error("Failed to send connection request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!status?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/connections/${status.id}/accept`, {
        method: "POST",
      });

      if (response.ok) {
        setStatus({
          ...status,
          status: "ACCEPTED",
        });
      }
    } catch (error) {
      console.error("Failed to accept connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!status?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/connections/${status.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStatus(null);
      }
    } catch (error) {
      console.error("Failed to withdraw connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <button disabled className="btn-primary flex items-center gap-2 opacity-50">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </button>
    );
  }

  // Already connected
  if (status?.status === "ACCEPTED") {
    return (
      <button className="btn-secondary flex items-center gap-2 cursor-default">
        <Check className="w-4 h-4" />
        Connected
      </button>
    );
  }

  // Pending - user sent the request
  if (status?.status === "PENDING" && !status.isReceiver) {
    return (
      <button
        onClick={handleWithdraw}
        className="btn-secondary flex items-center gap-2"
      >
        <Clock className="w-4 h-4" />
        Pending
      </button>
    );
  }

  // Pending - user received the request
  if (status?.status === "PENDING" && status.isReceiver) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="btn-primary flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Accept
        </button>
        <button
          onClick={handleWithdraw}
          className="btn-secondary flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Ignore
        </button>
      </div>
    );
  }

  // No connection - show Connect button
  return (
    <button
      onClick={handleConnect}
      className="btn-primary flex items-center gap-2"
    >
      <UserPlus className="w-4 h-4" />
      Connect
    </button>
  );
}
