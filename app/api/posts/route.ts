// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongodb";
import PostModel from "@/models/Post";
import CommentModel from "@/models/Comment";

export async function GET() {
  try {
    await mongooseConnect();

    // Get posts
    const posts = await PostModel.find({}).sort({ createdAt: -1 }).lean();

    // Fetch comments for all posts in one query
    const allPostIds = posts.map((p: any) => String(p._id ?? p.id));
    const comments = await CommentModel.find({ postId: { $in: allPostIds } }).sort({ createdAt: 1 }).lean();

    // group comments by postId
    const byPost: Record<string, any[]> = {};
    for (const c of comments) {
      (byPost[c.postId] ||= []).push(c);
    }

    // attach comments array (full objects) to each post
    const postsWithComments = posts.map((p: any) => {
      const pid = String(p._id ?? p.id);
      return { ...p, comments: byPost[pid] ?? [] };
    });

    return NextResponse.json(postsWithComments);
  } catch (err: any) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, imageUrl, authorId, authorName, authorImage } = body || {};

    if (!content || String(content).trim() === "") {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    await mongooseConnect();

    const newPost = await PostModel.create({
      content,
      imageUrl: imageUrl ?? null,
      authorId: authorId ?? "unknown",
      authorName: authorName ?? null,
      authorImage: authorImage ?? null,
      createdAt: new Date(),
      likes: [],
      comments: [],
    });

    return NextResponse.json(newPost);
  } catch (err: any) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
