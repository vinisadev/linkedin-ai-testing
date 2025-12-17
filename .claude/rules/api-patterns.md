# API Patterns

## Route Handler Structure

All API routes follow this pattern:

```tsx
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// 1. Define schema
const createPostSchema = z.object({
  content: z.string().min(1).max(3000),
  image: z.string().url().optional(),
});

// 2. Route handler
export async function POST(req: Request) {
  try {
    // 3. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 4. Parse and validate body
    const body = await req.json();
    const data = createPostSchema.parse(body);

    // 5. Business logic
    const post = await db.post.create({
      data: {
        ...data,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // 6. Return response
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    // 7. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## HTTP Status Codes

| Code | When to Use |
|------|-------------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (created) |
| 204 | Successful DELETE (no content) |
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate) |
| 500 | Internal server error |

## Dynamic Routes

```tsx
// app/api/posts/[postId]/route.ts

interface RouteParams {
  params: { postId: string };
}

export async function GET(req: Request, { params }: RouteParams) {
  const post = await db.post.findUnique({
    where: { id: params.postId },
  });

  if (!post) {
    return NextResponse.json(
      { error: "Post not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(post);
}
```

## Pagination Pattern

```tsx
const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const { cursor, limit } = paginationSchema.parse({
    cursor: searchParams.get("cursor"),
    limit: searchParams.get("limit"),
  });

  const posts = await db.post.findMany({
    take: limit + 1, // Fetch one extra to check for next page
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
  });

  let nextCursor: string | undefined;
  if (posts.length > limit) {
    const nextItem = posts.pop();
    nextCursor = nextItem?.id;
  }

  return NextResponse.json({
    items: posts,
    nextCursor,
  });
}
```

## Query Parameters

```tsx
// app/api/jobs/route.ts

const filterSchema = z.object({
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]).optional(),
  remote: z.coerce.boolean().optional(),
  q: z.string().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filters = filterSchema.parse(Object.fromEntries(searchParams));

  const jobs = await db.job.findMany({
    where: {
      active: true,
      ...(filters.type && { type: filters.type }),
      ...(filters.remote !== undefined && { remote: filters.remote }),
      ...(filters.q && {
        OR: [
          { title: { contains: filters.q, mode: "insensitive" } },
          { company: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    },
  });

  return NextResponse.json(jobs);
}
```

## Authorization Patterns

### Resource Ownership
```tsx
export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await db.post.findUnique({
    where: { id: params.postId },
    select: { authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check ownership
  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.post.delete({ where: { id: params.postId } });
  return new NextResponse(null, { status: 204 });
}
```

## Error Response Format

Always return consistent error shapes:

```typescript
// Single error
{ "error": "Error message" }

// Validation errors
{
  "error": "Validation failed",
  "details": [
    { "path": ["content"], "message": "Required" }
  ]
}
```
