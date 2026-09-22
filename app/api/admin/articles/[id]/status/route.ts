import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { validateAdminSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const newStatus = body.status as "draft" | "published" | undefined;

    const existing = await prisma.article.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const targetStatus = newStatus || (existing.status === "published" ? "draft" : "published");
    const isNowPublished = targetStatus === "published";
    const publishedAt = isNowPublished ? existing.publishedAt || new Date() : null;

    const updated = await prisma.article.update({
      where: { id },
      data: {
        status: targetStatus,
        publishedAt: publishedAt,
      },
    });

    try {
      revalidatePath("/");
      if (existing.category?.slug) {
        revalidatePath(`/${existing.category.slug}`);
      }
      revalidatePath(`/article/${existing.slug}`);
    } catch (err) {
      console.error("[REVALIDATE_ERROR]", err);
    }

    return NextResponse.json({
      success: true,
      status: updated.status,
      message: `Article is now ${updated.status}.`,
    });
  } catch (error) {
    console.error("[API_STATUS_TOGGLE_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while updating article status." },
      { status: 500 }
    );
  }
}
