import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Get suggested connections (people you may know)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's connections
    const existingConnections = await db.connection.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    // Get IDs of users we're already connected with or have pending requests
    const connectedUserIds = new Set(
      existingConnections.flatMap((c) => [c.senderId, c.receiverId])
    );
    connectedUserIds.add(session.user.id); // Exclude self

    // Get current user's profile for matching
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        location: true,
        profile: {
          select: {
            skills: { select: { name: true } },
            experiences: {
              select: { company: true },
              take: 5,
            },
          },
        },
      },
    });

    const userSkills = currentUser?.profile?.skills.map((s) => s.name) || [];
    const userCompanies =
      currentUser?.profile?.experiences.map((e) => e.company) || [];

    // Find suggested people based on:
    // 1. Same location
    // 2. Similar skills
    // 3. Worked at same companies
    const orConditions: Prisma.UserWhereInput[] = [];

    if (currentUser?.location) {
      orConditions.push({
        location: { contains: currentUser.location, mode: "insensitive" as Prisma.QueryMode },
      });
    }

    if (userSkills.length > 0) {
      orConditions.push({
        profile: {
          skills: {
            some: { name: { in: userSkills, mode: "insensitive" as Prisma.QueryMode } },
          },
        },
      });
    }

    if (userCompanies.length > 0) {
      orConditions.push({
        profile: {
          experiences: {
            some: { company: { in: userCompanies, mode: "insensitive" as Prisma.QueryMode } },
          },
        },
      });
    }

    const userSelect = {
      id: true,
      name: true,
      image: true,
      headline: true,
      location: true,
      profile: {
        select: {
          experiences: {
            take: 1,
            orderBy: { startDate: "desc" as const },
            where: { current: true },
            select: { title: true, company: true },
          },
        },
      },
      _count: {
        select: {
          connectionsSent: { where: { status: "ACCEPTED" as const } },
          connectionsReceived: { where: { status: "ACCEPTED" as const } },
        },
      },
    };

    const suggestions = await db.user.findMany({
      where: {
        AND: [
          { id: { notIn: Array.from(connectedUserIds) } },
          { onboardingComplete: true },
          ...(orConditions.length > 0 ? [{ OR: orConditions }] : []),
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: userSelect,
    });

    // If we don't have enough suggestions based on similarity, get recent users
    let allSuggestions = [...suggestions];
    if (allSuggestions.length < 10) {
      const additionalUsers = await db.user.findMany({
        where: {
          id: {
            notIn: [
              ...Array.from(connectedUserIds),
              ...allSuggestions.map((s) => s.id),
            ],
          },
          onboardingComplete: true,
        },
        take: 10 - allSuggestions.length,
        orderBy: { createdAt: "desc" },
        select: userSelect,
      });

      allSuggestions = [...allSuggestions, ...additionalUsers];
    }

    // Add connection status for each suggestion
    const suggestionsWithDetails = await Promise.all(
      allSuggestions.map(async (person) => {
        const connection = await db.connection.findFirst({
          where: {
            OR: [
              { senderId: session.user.id, receiverId: person.id },
              { senderId: person.id, receiverId: session.user.id },
            ],
          },
          select: { id: true, status: true, senderId: true },
        });

        return {
          ...person,
          totalConnections:
            person._count.connectionsSent + person._count.connectionsReceived,
          connectionStatus: connection
            ? {
                id: connection.id,
                status: connection.status,
                isReceiver: connection.senderId !== session.user.id,
              }
            : null,
        };
      })
    );

    return NextResponse.json(suggestionsWithDetails);
  } catch (error) {
    console.error("[API] GET /api/search/suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
