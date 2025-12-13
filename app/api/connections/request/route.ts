import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import ConnectionModel from "@/models/Connection";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json(); // receiverId
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  if (userId === session.user.id)
    return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });

  await mongooseConnect();

  const connection = await ConnectionModel.findOne({
    requesterId: session.user.id,
    receiverId: userId,
  });

  if (connection)
    return NextResponse.json({ error: "Request already exists" }, { status: 400 });

  const newConn = await ConnectionModel.create({
    requesterId: session.user.id,
    receiverId: userId,
    status: "pending",
  });

  return NextResponse.json(newConn);
}
