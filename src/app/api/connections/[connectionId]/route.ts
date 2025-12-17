import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: { connectionId: string };
}

// Delete/withdraw a connection
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connection = await db.connection.findUnique({
      where: { id: params.connectionId },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Only sender or receiver can delete the connection
    if (
      connection.senderId !== session.user.id &&
      connection.receiverId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.connection.delete({
      where: { id: params.connectionId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[API] DELETE /api/connections/[connectionId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
