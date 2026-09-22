import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { articleSchema, sanitizeArticleContent, generateSlug } from "@/lib/validations/article";
import { validateAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const whereClause: { status?: string } = {};
    if (status && (status === "published" || status === "draft")) {
      whereClause.status = status;
    }

    const articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        author: {
          select: { id: true, name: true },
        },
        company: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, articles });
  } catch (error) {
    console.error("[API_GET_ARTICLES_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while retrieving articles." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

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

    // Check slug uniqueness
    const existingArticle = await prisma.article.findUnique({
      where: { slug: data.slug },
    });

    if (existingArticle) {
      return NextResponse.json(
        { error: "An article with this URL slug already exists. Please choose a different slug." },
        { status: 409 }
      );
    }

    // Sanitize rich text HTML
    const sanitizedHtml = sanitizeArticleContent(data.content);

    // Resolve Tags (find or create)
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

    const isPublished = data.status === "published";
    const publishedAt = isPublished ? new Date() : null;

    const newArticle = await prisma.article.create({
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

    // Revalidate public caches if published
    if (isPublished) {
      try {
        revalidatePath("/");
        if (newArticle.category?.slug) {
          revalidatePath(`/${newArticle.category.slug}`);
        }
        revalidatePath(`/article/${newArticle.slug}`);
      } catch (err) {
        console.error("[REVALIDATE_ERROR]", err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        article: newArticle,
        message: isPublished ? "Article published successfully." : "Article saved as draft.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API_CREATE_ARTICLE_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while saving the article. Please try again." },
      { status: 500 }
    );
  }
}
