import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import ConnectionModel from "@/models/Connection";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ status: 'idle' });
  }

  const { userId } = await params;
  await mongooseConnect();

  const conn = await ConnectionModel.findOne({
    $or: [
      { requesterId: session.user.id, receiverId: userId },
      { requesterId: userId, receiverId: session.user.id },
    ],
  });

  if (!conn) return NextResponse.json({ status: 'idle' });

  return NextResponse.json({
    status: conn.status === 'accepted' ? 'connected' : 'pending',
  });
}
