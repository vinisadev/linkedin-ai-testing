import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
});

// POST /api/profile/skills - Create new skill
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = skillSchema.parse(body);

    // Get user's profile
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if skill already exists
    const existingSkill = await db.skill.findUnique({
      where: {
        profileId_name: {
          profileId: profile.id,
          name: data.name,
        },
      },
    });

    if (existingSkill) {
      return NextResponse.json(
        { error: "Skill already exists" },
        { status: 400 }
      );
    }

    const skill = await db.skill.create({
      data: {
        profileId: profile.id,
        name: data.name,
        endorsements: 0,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/profile/skills:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
