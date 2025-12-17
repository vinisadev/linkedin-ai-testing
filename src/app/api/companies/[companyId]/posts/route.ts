import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const createPostSchema = z.object({
  content: z.string().min(1).max(3000),
  image: z.string().optional(),
});

// GET /api/companies/[companyId]/posts - Get company posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10");

    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const posts = await db.companyPost.findMany({
      where: { companyId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    let nextCursor: string | undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem?.id;
    }

    // Get likes for current user
    const session = await getServerSession(authOptions);
    let userLikes: Set<string> = new Set();

    if (session?.user?.id) {
      const likes = await db.companyPostLike.findMany({
        where: {
          postId: { in: posts.map((p) => p.id) },
          userId: session.user.id,
        },
        select: { postId: true },
      });
      userLikes = new Set(likes.map((l) => l.postId));
    }

    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      isLiked: userLikes.has(post.id),
    }));

    return NextResponse.json({
      posts: postsWithLikeStatus,
      nextCursor,
    });
  } catch (error) {
    console.error("[API] GET /api/companies/[companyId]/posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/companies/[companyId]/posts - Create a post as the company
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

    // Check if user is a member of the company
    const membership = await db.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member of this company to post" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, image } = createPostSchema.parse(body);

    const post = await db.companyPost.create({
      data: {
        companyId,
        authorId: session.user.id,
        content,
        image,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/companies/[companyId]/posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
