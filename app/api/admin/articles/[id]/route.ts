import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { articleSchema, sanitizeArticleContent, generateSlug } from "@/lib/validations/article";
import { validateAdminSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        company: true,
        author: true,
        tags: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error("[API_GET_ARTICLE_ID_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while loading the article." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const existingArticle = await prisma.article.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const body = await req.json();
    const validationResult = articleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check slug uniqueness across other articles
    if (data.slug !== existingArticle.slug) {
      const slugConflict = await prisma.article.findUnique({
        where: { slug: data.slug },
      });
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { error: "An article with this URL slug already exists. Please choose another slug." },
          { status: 409 }
        );
      }
    }

    // Sanitize rich text HTML
    const sanitizedHtml = sanitizeArticleContent(data.content);

    // Resolve Tags
    const tagIds: string[] = [];
    if (data.tags && data.tags.length > 0) {
      for (const rawTag of data.tags) {
        const trimmed = rawTag.trim();
        if (!trimmed) continue;
        const tagSlug = generateSlug(trimmed);
        if (!tagSlug) continue;

        const tagRecord = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: { name: trimmed },
          create: {
            name: trimmed,
            slug: tagSlug,
            articleIds: [],
          },
        });
        tagIds.push(tagRecord.id);
      }
    }

    const isNowPublished = data.status === "published";
    const wasPublished = existingArticle.status === "published";
    const publishedAt = isNowPublished
      ? existingArticle.publishedAt || new Date()
      : null;

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        titleHi: data.titleHi || null,
        slug: data.slug,
        summary: data.summary,
        summaryHi: data.summaryHi || null,
        content: sanitizedHtml,
        contentHi: data.contentHi || null,
        imageUrl: data.imageUrl || null,
        status: data.status,
        publishedAt: publishedAt,
        isFeatured: data.isFeatured ?? false,
        categoryId: data.categoryId || null,
        companyId: data.companyId || null,
        authorId: data.authorId || null,
        tagIds: tagIds,
      },
      include: {
        category: true,
      },
    });

    // Revalidate relevant pages
    try {
      revalidatePath("/");
      if (existingArticle.category?.slug) {
        revalidatePath(`/${existingArticle.category.slug}`);
      }
      if (updatedArticle.category?.slug && updatedArticle.category.slug !== existingArticle.category?.slug) {
        revalidatePath(`/${updatedArticle.category.slug}`);
      }
      revalidatePath(`/article/${existingArticle.slug}`);
      if (updatedArticle.slug !== existingArticle.slug) {
        revalidatePath(`/article/${updatedArticle.slug}`);
      }
    } catch (err) {
      console.error("[REVALIDATE_ERROR]", err);
    }

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      message: isNowPublished ? "Article published successfully." : "Article saved as draft.",
    });
  } catch (error) {
    console.error("[API_UPDATE_ARTICLE_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while updating the article. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const articleToDelete = await prisma.article.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!articleToDelete) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await prisma.article.delete({
      where: { id },
    });

    // Revalidate paths
    try {
      revalidatePath("/");
      if (articleToDelete.category?.slug) {
        revalidatePath(`/${articleToDelete.category.slug}`);
      }
      revalidatePath(`/article/${articleToDelete.slug}`);
    } catch (err) {
      console.error("[REVALIDATE_ERROR]", err);
    }

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully.",
    });
  } catch (error) {
    console.error("[API_DELETE_ARTICLE_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting the article. Please try again." },
      { status: 500 }
    );
  }
}
