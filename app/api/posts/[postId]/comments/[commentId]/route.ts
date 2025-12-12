// app/api/comments/[commentId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import CommentModel from "@/models/Comment";
import PostModel from "@/models/Post";

export async function PUT(req: Request, { params }: { params: Promise<{ commentId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await params;
  const body = await req.json();
  const { content } = body || {};

  if (!content || String(content).trim() === "") {
    return NextResponse.json({ error: "Empty content" }, { status: 400 });
  }

  try {
    await mongooseConnect();

    const comment = await CommentModel.findById(commentId);
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // only author can edit
    if (String(comment.authorId) !== String(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    comment.content = content;
    await comment.save();

    return NextResponse.json(comment);
  } catch (err: any) {
    console.error("PUT /api/comments/[commentId] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ commentId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await params;

  try {
    await mongooseConnect();

    const comment = await CommentModel.findById(commentId);
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // authorize: author or post owner
    const post = await PostModel.findById(comment.postId);
    const userId = session.user.id;
    if (String(comment.authorId) !== String(userId) && String(post?.authorId) !== String(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // remove comment doc
    await CommentModel.findByIdAndDelete(commentId);

    // remove reference from post.comments array
    // remove reference from post.comments array
if (post) {
  post.comments = (post.comments || []).filter((id: string) => String(id) !== String(commentId));
  await post.save();
}


    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/comments/[commentId] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
