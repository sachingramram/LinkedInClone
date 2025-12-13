import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import ConnectionModel from "@/models/Connection";

export async function PUT(
  req: Request,
  { params }: { params: { connectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json(); // accepted | rejected
  if (!["accepted", "rejected"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  await mongooseConnect();

  const conn = await ConnectionModel.findById(params.connectionId);
  if (!conn) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (conn.receiverId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  conn.status = status;
  await conn.save();

  return NextResponse.json(conn);
}
