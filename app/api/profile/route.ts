import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import ProfileModel from "@/models/Profile";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  await mongooseConnect();
  const profile = await ProfileModel.findOne({ userId }).lean();
  return NextResponse.json(profile);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { headline, location, bio } = body;
  await mongooseConnect();
  const updated = await ProfileModel.findOneAndUpdate(
    { userId: session.user.id },
    { headline, location, bio, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  return NextResponse.json(updated);
}
