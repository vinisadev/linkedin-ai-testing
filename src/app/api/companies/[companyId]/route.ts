import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const updateCompanySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  headline: z.string().max(200).optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  location: z.string().optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
});

// GET /api/companies/[companyId] - Get company details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;

    const company = await db.company.findUnique({
      where: { id: companyId },
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
        posts: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
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
    console.error("[API] GET /api/companies/[companyId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/companies/[companyId] - Update company
export async function PATCH(
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
        { error: "Only owners and admins can update company details" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);

    const company = await db.company.update({
      where: { id: companyId },
      data: {
        ...validatedData,
        website: validatedData.website || null,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] PATCH /api/companies/[companyId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[companyId] - Delete company (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = await params;

    // Check if user is owner
    const membership = await db.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the owner can delete the company" },
        { status: 403 }
      );
    }

    await db.company.delete({
      where: { id: companyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/companies/[companyId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
