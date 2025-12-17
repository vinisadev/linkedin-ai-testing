import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const educationSchema = z.object({
  school: z.string().min(1, "School is required"),
  schoolLogo: z.string().optional(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

// PATCH /api/profile/education/[educationId] - Update education
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ educationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { educationId } = await params;
    const body = await req.json();
    const data = educationSchema.parse(body);

    // Verify ownership
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existingEducation = await db.education.findFirst({
      where: { id: educationId, profileId: profile.id },
    });

    if (!existingEducation) {
      return NextResponse.json({ error: "Education not found" }, { status: 404 });
    }

    const education = await db.education.update({
      where: { id: educationId },
      data: {
        school: data.school,
        schoolLogo: data.schoolLogo || null,
        degree: data.degree || null,
        field: data.field || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description || null,
      },
    });

    return NextResponse.json(education);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] PATCH /api/profile/education/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/education/[educationId] - Delete education
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ educationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { educationId } = await params;

    // Verify ownership
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existingEducation = await db.education.findFirst({
      where: { id: educationId, profileId: profile.id },
    });

    if (!existingEducation) {
      return NextResponse.json({ error: "Education not found" }, { status: 404 });
    }

    await db.education.delete({
      where: { id: educationId },
    });

    return NextResponse.json({ message: "Education deleted successfully" });
  } catch (error) {
    console.error("[API] DELETE /api/profile/education/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
