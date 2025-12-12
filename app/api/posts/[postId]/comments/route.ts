// app/api/posts/[postId]/comments/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import PostModel from "@/models/Post";
import CommentModel from "@/models/Comment";

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { postId } = await params;
  const body = await req.json();
  const { content } = body || {};

  if (!content || String(content).trim() === "") {
    return NextResponse.json({ error: "Empty content" }, { status: 400 });
  }

  try {
    await mongooseConnect();

    const post = await PostModel.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const created = await CommentModel.create({
      postId,
      authorId: session.user.id,
      authorName: session.user.name ?? null,
      content,
      createdAt: new Date(),
      replies: [],
    });

    // push id string
    post.comments = [...(post.comments || []), String(created._id)];
    await post.save();

    // return full comment object
    return NextResponse.json(created);
  } catch (err: any) {
    console.error("POST /api/posts/[postId]/comments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
