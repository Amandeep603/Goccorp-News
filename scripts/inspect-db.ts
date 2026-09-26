import prisma from "../lib/prisma";

async function main() {
  console.log("=== ALL COMPANIES ===");
  const companies = await prisma.company.findMany({
    include: {
      articles: {
        select: { id: true, title: true, categoryId: true, companyId: true },
      },
    },
  });
  for (const c of companies) {
    console.log(`Company: ID=${c.id}, Name="${c.name}", Slug="${c.slug}", Sector="${c.sector}", ArticlesCount=${c.articles.length}`);
    for (const a of c.articles) {
      console.log(`   Linked Article: [${a.id}] "${a.title}" (categoryId=${a.categoryId})`);
    }
  }

  console.log("\n=== ALL CATEGORIES ===");
  const categories = await prisma.category.findMany({
    include: {
      parent: true,
      children: true,
      _count: { select: { articles: true } },
    },
    orderBy: { name: "asc" },
  });
  for (const cat of categories) {
    console.log(`Category: ID=${cat.id}, Name="${cat.name}", Slug="${cat.slug}", Parent="${cat.parent?.name || 'NULL'}" (parentId=${cat.parentId}), ChildrenCount=${cat.children.length}, ArticlesCount=${cat._count.articles}`);
  }

  console.log("\n=== ALL ARTICLES ===");
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      categoryId: true,
      companyId: true,
      category: { select: { name: true, slug: true } },
      company: { select: { name: true, slug: true } },
    },
  });
  for (const a of articles) {
    console.log(`Article: [${a.id}] "${a.title}"`);
    console.log(`   Category: ${a.category ? `${a.category.name} (${a.category.slug})` : 'NONE'} [${a.categoryId}]`);
    console.log(`   Company: ${a.company ? `${a.company.name} (${a.company.slug})` : 'NONE'} [${a.companyId}]`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
