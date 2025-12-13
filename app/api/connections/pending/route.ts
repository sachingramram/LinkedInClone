import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { mongooseConnect } from "@/lib/mongodb";
import ConnectionModel from "@/models/Connection";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await mongooseConnect();

  const requests = await ConnectionModel.find({
    receiverId: session.user.id,
    status: "pending",
  }).lean();

  return NextResponse.json(requests);
}
