import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/companies/by-slug/[slug] - Get company by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const company = await db.company.findUnique({
      where: { slug },
      include: {
        members: {
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
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check if the current user is a member
    const session = await getServerSession(authOptions);
    let userMembership = null;

    if (session?.user?.id) {
      userMembership = company.members.find(
        (m) => m.userId === session.user.id
      );
    }

    return NextResponse.json({
      ...company,
      userRole: userMembership?.role || null,
      isMember: !!userMembership,
    });
  } catch (error) {
    console.error("[API] GET /api/companies/by-slug/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
