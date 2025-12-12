// app/api/comments/[commentId]/reply/[replyId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import CommentModel from "@/models/Comment";
import PostModel from "@/models/Post";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ commentId: string; replyId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId, replyId } = await params;
  const body = await req.json();
  const { content } = body || {};
  if (!content || String(content).trim() === "") return NextResponse.json({ error: "Empty content" }, { status: 400 });

  try {
    await mongooseConnect();

    const comment = await CommentModel.findById(commentId);
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const reply = (comment.replies || []).find((r: any) => String(r._id) === String(replyId));
    if (!reply) return NextResponse.json({ error: "Reply not found" }, { status: 404 });

    // only reply author can edit
    if (String(reply.authorId) !== String(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    reply.content = content;
    // mongoose will detect change in subdocument
    await comment.save();

    return NextResponse.json(reply);
  } catch (err: any) {
    console.error("PUT /api/comments/[commentId]/reply/[replyId] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ commentId: string; replyId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId, replyId } = await params;

  try {
    await mongooseConnect();

    const comment = await CommentModel.findById(commentId);
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const reply = (comment.replies || []).find((r: any) => String(r._id) === String(replyId));
    if (!reply) return NextResponse.json({ error: "Reply not found" }, { status: 404 });

    // authorize delete:
    // - reply author
    // - comment author
    // - post author
    const replyAuthorId = String(reply.authorId);
    const commentAuthorId = String(comment.authorId);

    const post = await PostModel.findById(comment.postId);
    const postAuthorId = post ? String(post.authorId) : null;
    const userId = String(session.user.id);

    if (
      userId !== replyAuthorId &&
      userId !== commentAuthorId &&
      userId !== postAuthorId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // remove reply by id
    comment.replies = (comment.replies || []).filter((r: any) => String(r._id) !== String(replyId));
    await comment.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/comments/[commentId]/reply/[replyId] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
