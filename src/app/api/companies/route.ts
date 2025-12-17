import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const createCompanySchema = z.object({
  name: z.string().min(1).max(100),
  headline: z.string().max(200).optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  location: z.string().optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET /api/companies - List companies the user owns or is a member of
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // Filter by role (OWNER, ADMIN, EDITOR)

    const whereClause: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (role) {
      whereClause.role = role;
    }

    const memberships = await db.companyMember.findMany({
      where: whereClause,
      include: {
        company: {
          include: {
            members: {
              select: {
                id: true,
                role: true,
                userId: true,
              },
            },
            _count: {
              select: {
                posts: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const companies = memberships.map((membership) => ({
      ...membership.company,
      memberCount: membership.company.members.length,
      postCount: membership.company._count.posts,
      userRole: membership.role,
    }));

    return NextResponse.json(companies);
  } catch (error) {
    console.error("[API] GET /api/companies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    // Generate a unique slug
    let slug = generateSlug(validatedData.name);
    let slugExists = await db.company.findUnique({ where: { slug } });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(validatedData.name)}-${counter}`;
      slugExists = await db.company.findUnique({ where: { slug } });
      counter++;
    }

    // Create company with the user as owner
    const company = await db.company.create({
      data: {
        name: validatedData.name,
        slug,
        headline: validatedData.headline,
        description: validatedData.description,
        website: validatedData.website || null,
        industry: validatedData.industry,
        companySize: validatedData.companySize,
        location: validatedData.location,
        foundedYear: validatedData.foundedYear,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
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

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/companies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
