import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const experienceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  companyId: z.string().optional().nullable(),
  companyLogo: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

// PATCH /api/profile/experience/[experienceId] - Update experience
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ experienceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { experienceId } = await params;
    const body = await req.json();
    const data = experienceSchema.parse(body);

    // Verify ownership
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existingExperience = await db.experience.findFirst({
      where: { id: experienceId, profileId: profile.id },
    });

    if (!existingExperience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    // If companyId is provided, verify it exists and get logo
    let companyLogo = data.companyLogo || null;
    if (data.companyId) {
      const linkedCompany = await db.company.findUnique({
        where: { id: data.companyId },
        select: { logo: true },
      });
      if (linkedCompany?.logo) {
        companyLogo = linkedCompany.logo;
      }
    }

    const experience = await db.experience.update({
      where: { id: experienceId },
      data: {
        title: data.title,
        company: data.company,
        companyId: data.companyId || null,
        companyLogo,
        location: data.location || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        current: data.current,
        description: data.description || null,
      },
      include: {
        linkedCompany: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    });

    return NextResponse.json(experience);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] PATCH /api/profile/experience/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/experience/[experienceId] - Delete experience
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ experienceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { experienceId } = await params;

    // Verify ownership
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existingExperience = await db.experience.findFirst({
      where: { id: experienceId, profileId: profile.id },
    });

    if (!existingExperience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    await db.experience.delete({
      where: { id: experienceId },
    });

    return NextResponse.json({ message: "Experience deleted successfully" });
  } catch (error) {
    console.error("[API] DELETE /api/profile/experience/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
