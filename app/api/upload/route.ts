import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as unknown as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder: 'linkedin_clone' },
      (error, result) => {
        if (error) return resolve(NextResponse.json({ error }, { status: 500 }));
        resolve(NextResponse.json({ url: result?.secure_url }));
      }
    );
    stream.end(buffer);
  });
}
