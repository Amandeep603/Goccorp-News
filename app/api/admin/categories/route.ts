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
      orderBy: [{ name: "asc" }],
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

    // Sub-categories MUST have a parent (top-level tabs are fixed to prevent navbar breaking)
    if (!parentId || typeof parentId !== "string" || !parentId.trim()) {
      return NextResponse.json(
        { error: "Parent category is required. Sub-categories must be assigned to an existing top-level parent." },
        { status: 400 }
      );
    }

    const parent = await prisma.category.findUnique({
      where: { id: parentId.trim() },
    });
    if (!parent) {
      return NextResponse.json(
        { error: "Selected parent category does not exist." },
        { status: 400 }
      );
    }

    // Auto-generate safe/unique slug with fallback collision handling
    let candidateSlug = slug ? generateSlug(slug) : generateSlug(name);
    if (!candidateSlug) {
      candidateSlug = generateSlug(name);
    }

    const collision = await prisma.category.findUnique({
      where: { slug: candidateSlug },
    });

    if (collision) {
      // Fallback: parent-slug + "-" + candidateSlug
      const fallbackSlug = `${parent.slug}-${candidateSlug}`;
      const secondCollision = await prisma.category.findUnique({
        where: { slug: fallbackSlug },
      });

      if (!secondCollision) {
        candidateSlug = fallbackSlug;
      } else {
        candidateSlug = `${fallbackSlug}-${Date.now().toString(36)}`;
      }
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: candidateSlug,
        parentId: parent.id,
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
    revalidatePath("/", "layout");
    revalidatePath("/api/categories");

    return NextResponse.json(
      { success: true, category, message: `Sub-category "${category.name}" created under "${parent.name}".` },
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
