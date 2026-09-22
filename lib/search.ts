import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function executeSearch({
  q,
  page = 1,
  limit = 20,
}: {
  q: string;
  page?: number;
  limit?: number;
}) {
  const trimmed = q.trim();
  if (!trimmed) {
    return {
      articles: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }

  const skip = (page - 1) * limit;

  // Find tags matching query
  const matchingTags = await prisma.tag.findMany({
    where: {
      name: { contains: trimmed, mode: "insensitive" },
    },
    select: { id: true },
  });
  const matchingTagIds = matchingTags.map((t) => t.id);

  const whereClause: Prisma.ArticleWhereInput = {
    status: "published",
    OR: [
      { title: { contains: trimmed, mode: "insensitive" } },
      { summary: { contains: trimmed, mode: "insensitive" } },
      ...(matchingTagIds.length > 0 ? [{ tagIds: { hasSome: matchingTagIds } }] : []),
      { company: { name: { contains: trimmed, mode: "insensitive" } } },
    ],
  };

  const [total, articles] = await Promise.all([
    prisma.article.count({ where: whereClause }),
    prisma.article.findMany({
      where: whereClause,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        titleHi: true,
        slug: true,
        summary: true,
        summaryHi: true,
        imageUrl: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            sector: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    articles,
    total,
    page,
    totalPages,
  };
}
