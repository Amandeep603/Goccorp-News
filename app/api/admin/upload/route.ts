import { NextResponse } from "next/server";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { validateAdminSession } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export async function POST(req: Request) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, WEBP, GIF, and AVIF images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 5MB limit." },
        { status: 400 }
      );
    }

    // Determine extension safely
    const originalExt = path.extname(file.name).toLowerCase() || ".jpg";
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
    const ext = allowedExts.includes(originalExt) ? originalExt : ".jpg";

    const uniqueName = `${crypto.randomUUID()}${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate binary magic bytes to guarantee file is a genuine image
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isGif = buffer.length >= 6 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
    const isWebp = buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";
    const isAvif = buffer.length >= 12 &&
      buffer.toString("ascii", 4, 8) === "ftyp" &&
      (buffer.toString("ascii", 8, 12).includes("avif") || buffer.toString("ascii", 8, 12).includes("mif1"));

    if (!isJpeg && !isPng && !isGif && !isWebp && !isAvif) {
      return NextResponse.json(
        { error: "Invalid image format. File binary content does not match allowed image signatures." },
        { status: 400 }
      );
    }

    // Upload directly to Vercel Blob cloud storage
    const blob = await put(`uploads/${uniqueName}`, buffer, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: uniqueName,
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    if (error?.message?.includes("Cannot use public access on a private store")) {
      return NextResponse.json(
        { error: "The configured Vercel Blob store is set to 'Private'. Public website images require a 'Public' Blob store so visitors can view them. Please create a Public store in Vercel." },
        { status: 500 }
      );
    }
    if (error?.message?.includes("No token found") || error?.name === "VercelBlobError") {
      return NextResponse.json(
        { error: "Vercel Blob storage token (BLOB_READ_WRITE_TOKEN) is not configured. Please set the BLOB_READ_WRITE_TOKEN environment variable." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong while uploading the file." },
      { status: 500 }
    );
  }
}
