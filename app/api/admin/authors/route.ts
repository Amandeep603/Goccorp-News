import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { validateAdminSession } from "@/lib/auth";

// GET /api/admin/authors - List all authors
export async function GET() {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const authors = await prisma.author.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, authors });
  } catch (error) {
    console.error("[API_GET_AUTHORS_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while retrieving authors." },
      { status: 500 }
    );
  }
}

// POST /api/admin/authors - Create an author
export async function POST(req: Request) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const body = await req.json();
    const { name, bio, imageUrl } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Author name must be at least 2 characters." },
        { status: 400 }
      );
    }

    let baseSlug = (body.slug?.trim() || name.trim())
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.author.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const author = await prisma.author.create({
      data: {
        name: name.trim(),
        slug,
        bio: bio && bio.trim() !== "" ? bio.trim() : null,
        imageUrl: imageUrl && imageUrl.trim() !== "" ? imageUrl.trim() : null,
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    revalidatePath("/admin/authors");
    revalidatePath("/(public)", "layout");

    return NextResponse.json(
      { success: true, author, message: "Author created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API_POST_AUTHOR_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while creating author." },
      { status: 500 }
    );
  }
}
