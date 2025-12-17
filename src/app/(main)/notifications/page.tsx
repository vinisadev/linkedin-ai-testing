"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  UserPlus,
  UserCheck,
  Heart,
  MessageCircle,
  Briefcase,
  MessageSquare,
  Building2,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type NotificationType =
  | "CONNECTION_REQUEST"
  | "CONNECTION_ACCEPTED"
  | "POST_LIKE"
  | "POST_COMMENT"
  | "JOB_APPLICATION"
  | "MESSAGE"
  | "COMPANY_INVITE";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const notificationIcons: Record<NotificationType, React.ElementType> = {
  CONNECTION_REQUEST: UserPlus,
  CONNECTION_ACCEPTED: UserCheck,
  POST_LIKE: Heart,
  POST_COMMENT: MessageCircle,
  JOB_APPLICATION: Briefcase,
  MESSAGE: MessageSquare,
  COMPANY_INVITE: Building2,
};

const notificationColors: Record<NotificationType, string> = {
  CONNECTION_REQUEST: "bg-linkedin-blue",
  CONNECTION_ACCEPTED: "bg-green-500",
  POST_LIKE: "bg-red-500",
  POST_COMMENT: "bg-orange-500",
  JOB_APPLICATION: "bg-purple-500",
  MESSAGE: "bg-linkedin-blue",
  COMPANY_INVITE: "bg-teal-500",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async (cursor?: string) => {
    try {
      const url = cursor
        ? `/api/notifications?cursor=${cursor}`
        : "/api/notifications";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (cursor) {
          setNotifications((prev) => [...prev, ...data.notifications]);
        } else {
          setNotifications(data.notifications);
        }
        setNextCursor(data.nextCursor || null);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const loadMore = () => {
    if (nextCursor && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchNotifications(nextCursor);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-linkedin-blue" />
            <h1 className="text-xl font-semibold text-linkedin-text-dark">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-linkedin-blue text-white text-xs rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-sm text-linkedin-blue hover:underline"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-linkedin-blue" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-linkedin-border-gray">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-linkedin-border-gray mx-auto mb-4" />
            <p className="text-linkedin-text-dark font-medium mb-1">
              No notifications yet
            </p>
            <p className="text-linkedin-text-gray text-sm">
              When you get notifications, they will show up here
            </p>
          </div>
        )}

        {/* Load More */}
        {nextCursor && (
          <div className="p-4 border-t border-linkedin-border-gray">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="w-full py-2 text-linkedin-blue hover:bg-linkedin-warm-gray rounded-md transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Load more"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (_id: string) => void;
}) {
  const Icon = notificationIcons[notification.type];
  const colorClass = notificationColors[notification.type];

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
  };

  const content = (
    <div
      className={cn(
        "flex gap-4 p-4 hover:bg-linkedin-warm-gray/50 transition-colors cursor-pointer",
        !notification.read && "bg-linkedin-warm-gray/30"
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          colorClass
        )}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm",
            notification.read ? "text-linkedin-text-gray" : "text-linkedin-text-dark font-medium"
          )}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-sm text-linkedin-text-gray mt-0.5 line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="text-xs text-linkedin-text-gray mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="flex-shrink-0 self-center">
          <div className="w-2 h-2 bg-linkedin-blue rounded-full" />
        </div>
      )}
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return content;
}
