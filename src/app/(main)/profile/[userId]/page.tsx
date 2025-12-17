import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ProfileExperience } from "@/components/profile/profile-experience";
import { ProfileEducation } from "@/components/profile/profile-education";
import { ProfileSkills } from "@/components/profile/profile-skills";

interface ProfilePageProps {
  params: { userId: string };
}

async function getProfile(userId: string, currentUserId?: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      headline: true,
      summary: true,
      location: true,
      website: true,
      createdAt: true,
      profile: {
        select: {
          id: true,
          bannerImage: true,
          about: true,
          experiences: {
            orderBy: { startDate: "desc" },
          },
          educations: {
            orderBy: { startDate: "desc" },
          },
          skills: {
            orderBy: { endorsements: "desc" },
          },
        },
      },
      _count: {
        select: {
          posts: true,
          connectionsSent: {
            where: { status: "ACCEPTED" },
          },
          connectionsReceived: {
            where: { status: "ACCEPTED" },
          },
        },
      },
    },
  });

  if (!user) return null;

  const isOwnProfile = currentUserId === userId;

  // Get connection status if viewing another user's profile
  let connectionStatus = null;
  if (currentUserId && !isOwnProfile) {
    const connection = await db.connection.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      },
    });

    if (connection) {
      connectionStatus = {
        id: connection.id,
        status: connection.status,
        isReceiver: connection.senderId !== currentUserId,
      };
    }
  }

  return {
    ...user,
    totalConnections: user._count.connectionsSent + user._count.connectionsReceived,
    isOwnProfile,
    connectionStatus,
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions);
  const profile = await getProfile(params.userId, session?.user?.id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <ProfileHeader profile={profile} />

      {profile.profile?.about && (
        <ProfileAbout
          about={profile.profile.about}
          isOwnProfile={profile.isOwnProfile}
        />
      )}

      {profile.profile?.experiences && profile.profile.experiences.length > 0 && (
        <ProfileExperience
          experiences={profile.profile.experiences}
          isOwnProfile={profile.isOwnProfile}
        />
      )}

      {profile.profile?.educations && profile.profile.educations.length > 0 && (
        <ProfileEducation
          educations={profile.profile.educations}
          isOwnProfile={profile.isOwnProfile}
        />
      )}

      {profile.profile?.skills && profile.profile.skills.length > 0 && (
        <ProfileSkills
          skills={profile.profile.skills}
          isOwnProfile={profile.isOwnProfile}
        />
      )}
    </div>
  );
}
