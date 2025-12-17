import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const transferOwnershipSchema = z.object({
  newOwnerId: z.string(),
});

// POST /api/companies/[companyId]/transfer-ownership - Transfer ownership to another member
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

    // Check if current user is the owner
    const currentMembership = await db.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId: session.user.id,
        },
      },
    });

    if (!currentMembership || currentMembership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the owner can transfer ownership" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { newOwnerId } = transferOwnershipSchema.parse(body);

    // Check if new owner is a member of the company
    const newOwnerMembership = await db.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId: newOwnerId,
        },
      },
    });

    if (!newOwnerMembership) {
      return NextResponse.json(
        { error: "The new owner must be a member of the company" },
        { status: 400 }
      );
    }

    // Transfer ownership in a transaction
    await db.$transaction([
      // Make current owner an admin
      db.companyMember.update({
        where: { id: currentMembership.id },
        data: { role: "ADMIN" },
      }),
      // Make new owner the owner
      db.companyMember.update({
        where: { id: newOwnerMembership.id },
        data: { role: "OWNER" },
      }),
    ]);

    // Get company name for notification
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    });

    // Notify the new owner
    await db.notification.create({
      data: {
        userId: newOwnerId,
        type: "COMPANY_INVITE",
        title: "Ownership transferred",
        body: `${session.user.name || "Someone"} has transferred ownership of ${company?.name || "a company"} to you`,
        link: `/company/${companyId}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/companies/[companyId]/transfer-ownership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
