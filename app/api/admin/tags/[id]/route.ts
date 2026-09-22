import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/validations/article";
import { validateAdminSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/tags/[id] - Update tag
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const existing = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Tag not found." }, { status: 404 });
    }

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

    // Check slug collision
    if (slug !== existing.slug) {
      const slugConflict = await prisma.tag.findUnique({
        where: { slug },
      });
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { error: `A tag with slug "${slug}" already exists.` },
          { status: 400 }
        );
      }
    }

    // Check name collision
    if (name.trim() !== existing.name) {
      const nameConflict = await prisma.tag.findUnique({
        where: { name: name.trim() },
      });
      if (nameConflict && nameConflict.id !== id) {
        return NextResponse.json(
          { error: `A tag with name "${name.trim()}" already exists.` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.tag.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    revalidatePath("/admin/tags");
    revalidatePath("/(public)", "layout");

    return NextResponse.json({
      success: true,
      tag: updated,
      message: "Tag updated successfully.",
    });
  } catch (error) {
    console.error("[API_PUT_TAG_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while updating tag." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tags/[id] - Delete tag with article usage safeguard
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found." }, { status: 404 });
    }

    const usageCount = tag._count.articles || (tag.articleIds ? tag.articleIds.length : 0);

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete tag "${tag.name}" because it is currently assigned to ${usageCount} article${
            usageCount === 1 ? "" : "s"
          }. Please remove it from those articles first.`,
        },
        { status: 400 }
      );
    }

    await prisma.tag.delete({
      where: { id },
    });

    revalidatePath("/admin/tags");
    revalidatePath("/(public)", "layout");

    return NextResponse.json({
      success: true,
      message: `Tag "${tag.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("[API_DELETE_TAG_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting tag." },
      { status: 500 }
    );
  }
}
