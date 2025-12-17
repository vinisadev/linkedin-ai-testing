import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const inviteMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(["ADMIN", "EDITOR"]).default("EDITOR"),
});

// GET /api/companies/[companyId]/members - List company members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;

    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const members = await db.companyMember.findMany({
      where: { companyId },
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
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("[API] GET /api/companies/[companyId]/members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/companies/[companyId]/members - Invite a user to the company
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = await params;

    // Check if user is owner or admin
    const membership = await db.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Only owners and admins can invite members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = inviteMemberSchema.parse(body);

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await db.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this company" },
        { status: 409 }
      );
    }

    // Check if there's already a pending invite
    const existingInvite = await db.companyInvite.findFirst({
      where: {
        companyId,
        userId,
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "User already has a pending invite" },
        { status: 409 }
      );
    }

    // Get company name for notification
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    });

    // Create invite (expires in 7 days)
    const invite = await db.companyInvite.create({
      data: {
        companyId,
        userId,
        role,
        invitedBy: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create notification for the invited user
    await db.notification.create({
      data: {
        userId,
        type: "COMPANY_INVITE",
        title: "Company page invitation",
        body: `${session.user.name || "Someone"} invited you to join ${company?.name || "a company"} as ${role.toLowerCase()}`,
        link: `/company-invites`,
      },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/companies/[companyId]/members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
