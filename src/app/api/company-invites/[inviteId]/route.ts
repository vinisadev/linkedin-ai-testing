import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const respondToInviteSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

// POST /api/company-invites/[inviteId] - Respond to invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inviteId } = await params;

    // Get the invite
    const invite = await db.companyInvite.findUnique({
      where: { id: inviteId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Check if invite belongs to current user
    if (invite.userId !== session.user.id) {
      return NextResponse.json(
        { error: "This invite is not for you" },
        { status: 403 }
      );
    }

    // Check if invite is still pending
    if (invite.status !== "PENDING") {
      return NextResponse.json(
        { error: "This invite has already been responded to" },
        { status: 400 }
      );
    }

    // Check if invite has expired
    if (invite.expiresAt < new Date()) {
      await db.companyInvite.update({
        where: { id: inviteId },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = respondToInviteSchema.parse(body);

    if (action === "accept") {
      // Check if user is already a member (edge case)
      const existingMember = await db.companyMember.findUnique({
        where: {
          companyId_userId: {
            companyId: invite.companyId,
            userId: session.user.id,
          },
        },
      });

      if (existingMember) {
        await db.companyInvite.update({
          where: { id: inviteId },
          data: { status: "ACCEPTED" },
        });
        return NextResponse.json(
          { error: "You are already a member of this company" },
          { status: 409 }
        );
      }

      // Accept invite - create membership and update invite status
      await db.$transaction([
        db.companyMember.create({
          data: {
            companyId: invite.companyId,
            userId: session.user.id,
            role: invite.role,
          },
        }),
        db.companyInvite.update({
          where: { id: inviteId },
          data: { status: "ACCEPTED" },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `You are now a member of ${invite.company.name}`,
        companyId: invite.companyId,
      });
    } else {
      // Reject invite
      await db.companyInvite.update({
        where: { id: inviteId },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({
        success: true,
        message: "Invite rejected",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/company-invites/[inviteId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
