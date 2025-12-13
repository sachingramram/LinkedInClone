import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import ConnectionModel from "@/models/Connection";

/**
 * ACCEPT / REJECT CONNECTION
 */
export async function PUT(
  req: Request,
  { params }: { params: { connectionId: string } } // ✅ NOT Promise
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { connectionId } = params; // ✅ direct access
  const { status } = await req.json(); // accepted | rejected

  if (!["accepted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await mongooseConnect();

  const connection = await ConnectionModel.findById(connectionId);
  if (!connection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // only receiver can respond
  if (String(connection.receiverId) !== String(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  connection.status = status;
  await connection.save();

  return NextResponse.json({ success: true });
}
