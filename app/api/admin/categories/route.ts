import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/validations/article";
import { validateAdminSession } from "@/lib/auth";

// GET /api/admin/categories - Fetch all categories with parent & counts
export async function GET() {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            articles: true,
            children: true,
          },
        },
      },
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("[API_GET_CATEGORIES_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while retrieving categories." },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create a category
export async function POST(req: Request) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const body = await req.json();
    const { name, parentId } = body;
    let slug = body.slug ? generateSlug(body.slug) : "";

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Category name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!slug) {
      slug = generateSlug(name);
    }

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A category with slug "${slug}" already exists.` },
        { status: 400 }
      );
    }

    // Verify parent exists if provided
    let validParentId: string | null = null;
    if (parentId && parentId.trim() !== "") {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "Selected parent category does not exist." },
          { status: 400 }
        );
      }
      validParentId = parent.id;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        parentId: validParentId,
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            articles: true,
            children: true,
          },
        },
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/(public)", "layout");

    return NextResponse.json(
      { success: true, category, message: "Category created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API_POST_CATEGORY_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while creating category." },
      { status: 500 }
    );
  }
}
