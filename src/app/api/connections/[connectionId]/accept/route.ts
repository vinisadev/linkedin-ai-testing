import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: { connectionId: string };
}

// Accept a connection request
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connection = await db.connection.findUnique({
      where: { id: params.connectionId },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Only the receiver can accept the connection
    if (connection.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Must be pending to accept
    if (connection.status !== "PENDING") {
      return NextResponse.json(
        { error: "Connection is not pending" },
        { status: 400 }
      );
    }

    // Update connection status
    const updatedConnection = await db.connection.update({
      where: { id: params.connectionId },
      data: { status: "ACCEPTED" },
    });

    // Create notification for the sender
    await db.notification.create({
      data: {
        userId: connection.senderId,
        type: "CONNECTION_ACCEPTED",
        title: "Connection accepted",
        body: `${session.user.name || "Someone"} accepted your connection request`,
        link: `/profile/${session.user.id}`,
      },
    });

    return NextResponse.json(updatedConnection);
  } catch (error) {
    console.error("[API] POST /api/connections/[connectionId]/accept:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
