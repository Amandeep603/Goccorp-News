import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/validations/article";
import { validateAdminSession } from "@/lib/auth";

// GET /api/admin/tags - List all tags with article counts
export async function GET() {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, tags });
  } catch (error) {
    console.error("[API_GET_TAGS_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while retrieving tags." },
      { status: 500 }
    );
  }
}

// POST /api/admin/tags - Create a tag
export async function POST(req: Request) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const body = await req.json();
    const { name } = body;
    let slug = body.slug ? generateSlug(body.slug) : "";

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Tag name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!slug) {
      slug = generateSlug(name);
    }

    // Check name and slug uniqueness
    const existingSlug = await prisma.tag.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: `A tag with slug "${slug}" already exists.` },
        { status: 400 }
      );
    }

    const existingName = await prisma.tag.findUnique({
      where: { name: name.trim() },
    });
    if (existingName) {
      return NextResponse.json(
        { error: `A tag with name "${name.trim()}" already exists.` },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug,
        articleIds: [],
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    revalidatePath("/admin/tags");
    revalidatePath("/(public)", "layout");

    return NextResponse.json(
      { success: true, tag, message: "Tag created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API_POST_TAG_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while creating tag." },
      { status: 500 }
    );
  }
}
