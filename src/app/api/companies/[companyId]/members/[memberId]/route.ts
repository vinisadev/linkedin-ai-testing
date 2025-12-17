import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const updateMemberSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR"]),
});

// PATCH /api/companies/[companyId]/members/[memberId] - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, memberId } = await params;

    // Check if current user is owner or admin
    const currentMembership = await db.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId: session.user.id,
        },
      },
    });

    if (!currentMembership || !["OWNER", "ADMIN"].includes(currentMembership.role)) {
      return NextResponse.json(
        { error: "Only owners and admins can update member roles" },
        { status: 403 }
      );
    }

    // Get target member
    const targetMember = await db.companyMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.companyId !== companyId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Cannot change owner's role
    if (targetMember.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot change the owner's role. Use transfer ownership instead." },
        { status: 403 }
      );
    }

    // Admins cannot change other admins' roles
    if (currentMembership.role === "ADMIN" && targetMember.role === "ADMIN") {
      return NextResponse.json(
        { error: "Admins cannot change other admins' roles" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role } = updateMemberSchema.parse(body);

    const updatedMember = await db.companyMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            headline: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] PATCH /api/companies/[companyId]/members/[memberId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[companyId]/members/[memberId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, memberId } = await params;

    // Get target member
    const targetMember = await db.companyMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: { id: true },
        },
      },
    });

    if (!targetMember || targetMember.companyId !== companyId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if user is removing themselves
    const isSelfRemoval = targetMember.userId === session.user.id;

    if (isSelfRemoval) {
      // Owners cannot remove themselves (must transfer ownership first)
      if (targetMember.role === "OWNER") {
        return NextResponse.json(
          { error: "Owners cannot leave. Transfer ownership first." },
          { status: 403 }
        );
      }

      // Users can remove themselves
      await db.companyMember.delete({
        where: { id: memberId },
      });

      return NextResponse.json({ success: true });
    }

    // Check if current user has permission to remove others
    const currentMembership = await db.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId: session.user.id,
        },
      },
    });

    if (!currentMembership) {
      return NextResponse.json(
        { error: "You are not a member of this company" },
        { status: 403 }
      );
    }

    // Only owner can remove members
    if (currentMembership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the owner can remove other members" },
        { status: 403 }
      );
    }

    // Cannot remove the owner
    if (targetMember.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot remove the owner" },
        { status: 403 }
      );
    }

    await db.companyMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/companies/[companyId]/members/[memberId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
