import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/validations/article";
import { validateAdminSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

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

    // Ensure slug is unique if changed
    if (slug !== existingCategory.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug },
      });
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { error: `A category with slug "${slug}" already exists.` },
          { status: 400 }
        );
      }
    }

    // Validate parent: cannot be self
    let validParentId: string | null = null;
    if (parentId && parentId.trim() !== "") {
      if (parentId === id) {
        return NextResponse.json(
          { error: "A category cannot be its own parent." },
          { status: 400 }
        );
      }

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

    const updated = await prisma.category.update({
      where: { id },
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
    revalidatePath("/", "layout");
    revalidatePath("/api/categories");

    return NextResponse.json({
      success: true,
      category: updated,
      message: "Category updated successfully.",
    });
  } catch (error) {
    console.error("[API_PUT_CATEGORY_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while updating category." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Delete category with safeguards
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    // Prevent deleting seeded top-level categories
    if (category.parentId === null) {
      return NextResponse.json(
        {
          error: `Top-level navigation category "${category.name}" cannot be deleted to preserve the core navbar structure.`,
        },
        { status: 400 }
      );
    }

    // 1. Prevent deleting if category has child categories
    if (category._count.children > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${category.name}" because it has ${category._count.children} subcategor${
            category._count.children === 1 ? "y" : "ies"
          }. Please reassign or delete the subcategories first.`,
        },
        { status: 400 }
      );
    }

    // 2. Prevent deleting if category has articles
    if (category._count.articles > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${category.name}" because it contains ${category._count.articles} published/draft article${
            category._count.articles === 1 ? "" : "s"
          }. Please reassign or delete those articles first.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");
    revalidatePath("/api/categories");

    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("[API_DELETE_CATEGORY_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting category." },
      { status: 500 }
    );
  }
}
