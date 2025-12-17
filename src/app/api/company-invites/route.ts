import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/company-invites - Get user's pending company invites
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invites = await db.companyInvite.findMany({
      where: {
        userId: session.user.id,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            headline: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error("[API] GET /api/company-invites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
