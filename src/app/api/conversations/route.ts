import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/conversations - List user's conversations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await db.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
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
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Transform to include the other participant and unread count
    const transformedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p.userId !== session.user.id
        );
        const currentParticipant = conv.participants.find(
          (p) => p.userId === session.user.id
        );

        const unreadCount = await db.message.count({
          where: {
            conversationId: conv.id,
            receiverId: session.user.id,
            read: false,
          },
        });

        return {
          id: conv.id,
          lastMessageAt: conv.lastMessageAt,
          otherUser: otherParticipant?.user || null,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          lastReadAt: currentParticipant?.lastReadAt,
        };
      })
    );

    return NextResponse.json(transformedConversations);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create or get existing conversation with a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    // Check if user exists
    const otherUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if conversation already exists between these two users (exactly 2 participants)
    // Use a transaction to prevent race conditions
    const conversation = await db.$transaction(async (tx) => {
      // Find existing conversation with exactly these two participants
      const existingConversations = await tx.conversation.findMany({
        where: {
          AND: [
            { participants: { some: { userId: session.user.id } } },
            { participants: { some: { userId } } },
          ],
        },
        include: {
          participants: {
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
          },
        },
      });

      // Filter to find a conversation with exactly 2 participants (1-on-1 chat)
      const existingConversation = existingConversations.find(
        (conv) => conv.participants.length === 2
      );

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      return await tx.conversation.create({
        data: {
          participants: {
            create: [{ userId: session.user.id }, { userId }],
          },
        },
        include: {
          participants: {
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
          },
        },
      });
    });

    // Return 200 for existing, 201 for new (check if it was just created by looking at messages)
    const isNew = await db.message.count({ where: { conversationId: conversation.id } }) === 0;
    return NextResponse.json(conversation, { status: isNew ? 201 : 200 });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
