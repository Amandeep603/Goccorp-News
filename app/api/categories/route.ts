import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const revalidate = 30; // Cache for 30s, revalidated immediately on admin changes

export async function GET() {
  try {
    const topLevelCategories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        children: {
          orderBy: [{ order: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Format for navbar consumption
    const navItems = topLevelCategories.map((cat) => {
      const isHome = cat.slug === "home";
      const href = isHome ? "/" : `/${cat.slug}`;

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        href,
        subItems: cat.children.map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          href: `/${cat.slug}/${child.slug}`,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      categories: topLevelCategories,
      navItems,
    });
  } catch (error) {
    console.error("[API_GET_PUBLIC_CATEGORIES_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load categories." },
      { status: 500 }
    );
  }
}
