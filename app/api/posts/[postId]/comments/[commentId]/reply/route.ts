// app/api/comments/[commentId]/reply/route.ts
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import CommentModel from "@/models/Comment";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await params;
  const body = await req.json();
  const { content } = body || {};
  if (!content || String(content).trim() === "") return NextResponse.json({ error: "Empty content" }, { status: 400 });

  try {
    await mongooseConnect();

    const comment = await CommentModel.findById(commentId);
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const reply = {
      _id: uuidv4(),
      authorId: session.user.id,
      authorName: session.user.name ?? null,
      content,
      createdAt: new Date(),
    };

    comment.replies = [...(comment.replies || []), reply];
    await comment.save();

    return NextResponse.json(reply);
  } catch (err: any) {
    console.error("POST /api/comments/[commentId]/reply error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
