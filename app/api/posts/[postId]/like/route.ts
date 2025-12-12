// app/api/posts/[postId]/like/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import PostModel from "@/models/Post";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = session.user.id;
  const { postId } = await params;

  try {
    await mongooseConnect();
    const post = await PostModel.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const alreadyLiked = post.likes?.includes(userId);
    if (alreadyLiked) {
      post.likes = (post.likes || []).filter((u: string) => u !== userId);
    } else {
      post.likes = [...(post.likes || []), userId];
    }

    await post.save();
    return NextResponse.json(post);
  } catch (err: any) {
    console.error("POST /api/posts/[postId]/like error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
