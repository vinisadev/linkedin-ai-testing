import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: { userId: string };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = params;

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
              select: {
                id: true,
                title: true,
                company: true,
                companyLogo: true,
                location: true,
                startDate: true,
                endDate: true,
                current: true,
                description: true,
              },
            },
            educations: {
              orderBy: { startDate: "desc" },
              select: {
                id: true,
                school: true,
                schoolLogo: true,
                degree: true,
                field: true,
                startDate: true,
                endDate: true,
                description: true,
              },
            },
            skills: {
              orderBy: { endorsements: "desc" },
              select: {
                id: true,
                name: true,
                endorsements: true,
              },
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if this is the current user's own profile
    const isOwnProfile = session?.user?.id === userId;

    // Check connection status if viewing another user's profile
    let connectionStatus = null;
    if (session?.user?.id && !isOwnProfile) {
      const connection = await db.connection.findFirst({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: userId },
            { senderId: userId, receiverId: session.user.id },
          ],
        },
        select: {
          id: true,
          status: true,
          senderId: true,
        },
      });

      if (connection) {
        connectionStatus = {
          id: connection.id,
          status: connection.status,
          isReceiver: connection.senderId !== session.user.id,
        };
      }
    }

    // Calculate total connections
    const totalConnections =
      user._count.connectionsSent + user._count.connectionsReceived;

    return NextResponse.json({
      ...user,
      totalConnections,
      isOwnProfile,
      connectionStatus,
    });
  } catch (error) {
    console.error("[API] GET /api/users/[userId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
