import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const searchSchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(["people", "jobs", "all"]).optional().default("all"),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  cursor: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const params = searchSchema.parse({
      q: searchParams.get("q"),
      type: searchParams.get("type") || undefined,
      limit: searchParams.get("limit") || undefined,
      cursor: searchParams.get("cursor") || undefined,
    });

    const { q, type, limit, cursor } = params;
    const searchTerms = q.split(" ").filter(Boolean);

    const results: {
      people: any[];
      jobs: any[];
      nextCursor?: string;
    } = {
      people: [],
      jobs: [],
    };

    // Search for people
    if (type === "people" || type === "all") {
      const mode: Prisma.QueryMode = "insensitive";

      // Build search conditions for each term
      const searchConditions: Prisma.UserWhereInput[] = [];
      for (const term of searchTerms) {
        searchConditions.push({ name: { contains: term, mode } });
        searchConditions.push({ headline: { contains: term, mode } });
        searchConditions.push({ location: { contains: term, mode } });
        searchConditions.push({
          profile: {
            skills: {
              some: { name: { contains: term, mode } },
            },
          },
        });
        searchConditions.push({
          profile: {
            experiences: {
              some: {
                OR: [
                  { title: { contains: term, mode } },
                  { company: { contains: term, mode } },
                ],
              },
            },
          },
        });
      }

      const people = await db.user.findMany({
        where: {
          id: { not: session.user.id },
          onboardingComplete: true,
          OR: searchConditions,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          image: true,
          headline: true,
          location: true,
          profile: {
            select: {
              experiences: {
                take: 1,
                orderBy: { startDate: "desc" },
                where: { current: true },
                select: {
                  title: true,
                  company: true,
                },
              },
            },
          },
          _count: {
            select: {
              connectionsSent: { where: { status: "ACCEPTED" } },
              connectionsReceived: { where: { status: "ACCEPTED" } },
            },
          },
        },
      });

      // Check connection status for each person
      const peopleWithConnectionStatus = await Promise.all(
        people.slice(0, limit).map(async (person) => {
          const connection = await db.connection.findFirst({
            where: {
              OR: [
                { senderId: session.user.id, receiverId: person.id },
                { senderId: person.id, receiverId: session.user.id },
              ],
            },
            select: { id: true, status: true, senderId: true },
          });

          return {
            ...person,
            totalConnections:
              person._count.connectionsSent + person._count.connectionsReceived,
            connectionStatus: connection
              ? {
                  id: connection.id,
                  status: connection.status,
                  isReceiver: connection.senderId !== session.user.id,
                }
              : null,
          };
        })
      );

      results.people = peopleWithConnectionStatus;

      if (people.length > limit) {
        results.nextCursor = people[limit - 1].id;
      }
    }

    // Search for jobs (if implemented)
    if (type === "jobs" || type === "all") {
      const jobMode: Prisma.QueryMode = "insensitive";
      const jobs = await db.job.findMany({
        where: {
          active: true,
          OR: searchTerms.flatMap((term) => [
            { title: { contains: term, mode: jobMode } },
            { company: { contains: term, mode: jobMode } },
            { location: { contains: term, mode: jobMode } },
            { description: { contains: term, mode: jobMode } },
          ]),
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          company: true,
          companyLogo: true,
          location: true,
          remote: true,
          type: true,
          createdAt: true,
        },
      });

      results.jobs = jobs;
    }

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] GET /api/search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
