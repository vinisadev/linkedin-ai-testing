import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalConnections =
      user._count.connectionsSent + user._count.connectionsReceived;

    return NextResponse.json({
      ...user,
      totalConnections,
      isOwnProfile: true,
    });
  } catch (error) {
    console.error("[API] GET /api/users/me:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  headline: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  about: z.string().optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const { about, ...userData } = data;

    // Update user data
    await db.user.update({
      where: { id: session.user.id },
      data: userData,
    });

    // Update profile about section if provided
    if (about !== undefined) {
      await db.profile.update({
        where: { userId: session.user.id },
        data: { about },
      });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] PATCH /api/users/me:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
