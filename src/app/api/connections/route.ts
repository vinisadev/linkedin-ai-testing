import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const createConnectionSchema = z.object({
  receiverId: z.string(),
  message: z.string().optional(),
});

// Send a connection request
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, message } = createConnectionSchema.parse(body);

    // Can't connect with yourself
    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot connect with yourself" },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if connection already exists
    const existingConnection = await db.connection.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId },
          { senderId: receiverId, receiverId: session.user.id },
        ],
      },
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: "Connection already exists", connection: existingConnection },
        { status: 409 }
      );
    }

    // Create connection request
    const connection = await db.connection.create({
      data: {
        senderId: session.user.id,
        receiverId,
        message,
        status: "PENDING",
      },
    });

    // Create notification for receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        type: "CONNECTION_REQUEST",
        title: "New connection request",
        body: `${session.user.name || "Someone"} wants to connect with you`,
        link: `/profile/${session.user.id}`,
      },
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] POST /api/connections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get user's connections
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ACCEPTED";

    const connections = await db.connection.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
        status: status as any,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            headline: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
            headline: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform to show the "other" user in each connection
    const formattedConnections = connections.map((conn) => {
      const otherUser =
        conn.senderId === session.user.id ? conn.receiver : conn.sender;
      return {
        id: conn.id,
        status: conn.status,
        createdAt: conn.createdAt,
        user: otherUser,
        isReceiver: conn.receiverId === session.user.id,
      };
    });

    return NextResponse.json(formattedConnections);
  } catch (error) {
    console.error("[API] GET /api/connections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
