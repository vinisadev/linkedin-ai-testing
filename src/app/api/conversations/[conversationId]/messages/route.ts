import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/conversations/[conversationId]/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Verify user is a participant and get the other participant
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Not a participant of this conversation" },
        { status: 403 }
      );
    }

    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== session.user.id
    );

    if (!otherParticipant) {
      return NextResponse.json(
        { error: "Other participant not found" },
        { status: 400 }
      );
    }

    // Create the message
    const message = await db.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        receiverId: otherParticipant.userId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update conversation's lastMessageAt
    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Create notification for the receiver
    await db.notification.create({
      data: {
        userId: otherParticipant.userId,
        type: "MESSAGE",
        title: `New message from ${session.user.name || "Someone"}`,
        body: content.trim().substring(0, 100),
        link: `/messaging?conversation=${conversationId}`,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
