"use client";

import { MapPin, Link as LinkIcon, Pencil, MessageSquare } from "lucide-react";
import Link from "next/link";
import { ConnectionButton } from "./connection-button";

interface ProfileHeaderProps {
  profile: {
    id: string;
    name: string | null;
    image: string | null;
    headline: string | null;
    location: string | null;
    website: string | null;
    totalConnections: number;
    isOwnProfile: boolean;
    connectionStatus: {
      id: string;
      status: string;
      isReceiver: boolean;
    } | null;
    profile: {
      bannerImage: string | null;
    } | null;
  };
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="card overflow-hidden">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-linkedin-blue to-linkedin-light-blue relative">
        {profile.profile?.bannerImage && (
          <img
            src={profile.profile.bannerImage}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        )}
        {profile.isOwnProfile && (
          <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
            <Pencil className="w-4 h-4 text-linkedin-text-gray" />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="-mt-16 mb-4 relative inline-block">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linkedin-blue text-white text-4xl flex items-center justify-center">
                {profile.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          {profile.isOwnProfile && (
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-linkedin-border-gray shadow-md hover:bg-gray-50">
              <Pencil className="w-4 h-4 text-linkedin-text-gray" />
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            {/* Name and Edit Button */}
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-linkedin-text-dark">
                {profile.name || "LinkedIn User"}
              </h1>
              {profile.isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="p-1 hover:bg-linkedin-warm-gray rounded-full"
                >
                  <Pencil className="w-5 h-5 text-linkedin-text-gray" />
                </Link>
              )}
            </div>

            {/* Headline */}
            {profile.headline && (
              <p className="text-linkedin-text-dark mt-1">{profile.headline}</p>
            )}

            {/* Location & Website */}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-linkedin-text-gray">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-linkedin-blue hover:underline"
                >
                  <LinkIcon className="w-4 h-4" />
                  Website
                </a>
              )}
            </div>

            {/* Connections */}
            <Link
              href="/network"
              className="text-linkedin-blue font-semibold text-sm mt-2 inline-block hover:underline"
            >
              {profile.totalConnections} connection{profile.totalConnections !== 1 ? "s" : ""}
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {profile.isOwnProfile ? (
              <>
                <Link href="/profile/edit" className="btn-primary">
                  Edit profile
                </Link>
                <button className="btn-secondary">Add section</button>
              </>
            ) : (
              <>
                <ConnectionButton
                  userId={profile.id}
                  connectionStatus={profile.connectionStatus}
                />
                <Link
                  href={`/messaging?user=${profile.id}`}
                  className="btn-secondary flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
