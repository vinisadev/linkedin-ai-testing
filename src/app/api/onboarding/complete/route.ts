import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const onboardingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  headline: z.string().optional().default(""),
  location: z.string().optional().default(""),
  image: z.string().optional().default(""),
  currentPosition: z
    .object({
      title: z.string(),
      company: z.string(),
      startDate: z.string(),
      current: z.boolean(),
      description: z.string(),
    })
    .nullable()
    .optional(),
  education: z
    .object({
      school: z.string(),
      degree: z.string(),
      field: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    })
    .nullable()
    .optional(),
  skills: z.array(z.string()).optional().default([]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = onboardingSchema.parse(body);

    // Update user and profile in a transaction
    await db.$transaction(async (tx) => {
      // Update user basic info
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          name: `${data.firstName} ${data.lastName}`,
          headline: data.headline || null,
          location: data.location || null,
          image: data.image || null,
          onboardingComplete: true,
        },
      });

      // Get or create profile
      let profile = await tx.profile.findUnique({
        where: { userId: session.user.id },
      });

      if (!profile) {
        profile = await tx.profile.create({
          data: { userId: session.user.id },
        });
      }

      // Add current position if provided
      if (data.currentPosition && data.currentPosition.title && data.currentPosition.company) {
        await tx.experience.create({
          data: {
            profileId: profile.id,
            title: data.currentPosition.title,
            company: data.currentPosition.company,
            startDate: data.currentPosition.startDate
              ? new Date(data.currentPosition.startDate)
              : new Date(),
            current: data.currentPosition.current,
            description: data.currentPosition.description || null,
          },
        });
      }

      // Add education if provided
      if (data.education && data.education.school) {
        await tx.education.create({
          data: {
            profileId: profile.id,
            school: data.education.school,
            degree: data.education.degree || null,
            field: data.education.field || null,
            startDate: data.education.startDate
              ? new Date(data.education.startDate)
              : new Date(),
            endDate: data.education.endDate
              ? new Date(data.education.endDate)
              : null,
          },
        });
      }

      // Add skills if provided
      if (data.skills && data.skills.length > 0) {
        await tx.skill.createMany({
          data: data.skills.map((skill) => ({
            profileId: profile!.id,
            name: skill,
          })),
          skipDuplicates: true,
        });
      }
    });

    return NextResponse.json({ message: "Profile completed successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/onboarding/complete:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
