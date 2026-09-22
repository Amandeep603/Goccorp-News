import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { validateAdminSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/authors/[id] - Update author
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const existing = await prisma.author.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Author not found." }, { status: 404 });
    }

    const body = await req.json();
    const { name, bio, imageUrl } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Author name must be at least 2 characters." },
        { status: 400 }
      );
    }

    let slug = existing.slug;
    if (body.slug && body.slug.trim() !== "") {
      slug = body.slug
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    } else if (!slug) {
      slug = name
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const updated = await prisma.author.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        bio: bio !== undefined ? (bio && bio.trim() !== "" ? bio.trim() : null) : existing.bio,
        imageUrl: imageUrl !== undefined ? (imageUrl && imageUrl.trim() !== "" ? imageUrl.trim() : null) : existing.imageUrl,
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    revalidatePath("/admin/authors");
    revalidatePath("/(public)", "layout");

    return NextResponse.json({
      success: true,
      author: updated,
      message: "Author updated successfully.",
    });
  } catch (error) {
    console.error("[API_PUT_AUTHOR_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while updating author." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/authors/[id] - Delete author
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Author not found." }, { status: 404 });
    }

    // Unlink authorId from articles to avoid dangling references
    if (author._count.articles > 0) {
      await prisma.article.updateMany({
        where: { authorId: id },
        data: { authorId: null },
      });
    }

    await prisma.author.delete({
      where: { id },
    });

    revalidatePath("/admin/authors");
    revalidatePath("/(public)", "layout");

    return NextResponse.json({
      success: true,
      message: `Author "${author.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("[API_DELETE_AUTHOR_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting author." },
      { status: 500 }
    );
  }
}
