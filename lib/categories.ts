import prisma from "@/lib/prisma";

export type SubItem = {
  id?: string;
  name: string;
  slug?: string;
  href: string;
};

export type NavItem = {
  id?: string;
  name: string;
  slug?: string;
  href: string;
  subItems?: SubItem[];
};

export async function getNavbarCategories(): Promise<NavItem[]> {
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

    return topLevelCategories.map((cat) => {
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
  } catch (error) {
    console.error("[GET_NAVBAR_CATEGORIES_ERROR]", error);
    return [];
  }
}
