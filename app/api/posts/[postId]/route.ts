// app/api/posts/[postId]/route.ts
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongodb";
import PostModel from "@/models/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  try {
    await mongooseConnect();
    const post = await PostModel.findById(postId).lean();
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (err: any) {
    console.error("GET /api/posts/[postId] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { postId } = await params;

  try {
    await mongooseConnect();

    const post = await PostModel.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Only post author can delete
    const userId = String(session.user.id);
    if (String(post.authorId) !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await PostModel.findByIdAndDelete(postId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/posts/[postId] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
