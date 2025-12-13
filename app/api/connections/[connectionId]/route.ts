import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import ConnectionModel from "@/models/Connection";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ connectionId: string }> } // ✅ MUST be Promise
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { connectionId } = await context.params; // ✅ await params
  const { status } = await request.json();

  if (!["accepted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await mongooseConnect();

  const connection = await ConnectionModel.findById(connectionId);
  if (!connection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // only receiver can accept / reject
  if (String(connection.receiverId) !== String(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  connection.status = status;
  await connection.save();

  return NextResponse.json({ success: true });
}
