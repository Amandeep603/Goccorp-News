import prisma from "../lib/prisma";

async function main() {
  console.log("=== 1. AUDIT ONGC ARTICLE ===");
  const ongcCompany = await prisma.company.findFirst({
    where: {
      name: { contains: "Oil and Natural Gas", mode: "insensitive" },
    },
    include: {
      articles: {
        include: {
          category: {
            include: {
              parent: true,
            },
          },
        },
      },
    },
  });

  if (!ongcCompany) {
    console.log("ONGC Company not found!");
  } else {
    console.log(`Found Company: ${ongcCompany.name} (Sector: ${ongcCompany.sector})`);
    console.log(`Articles linked (${ongcCompany.articles.length}):`);
    for (const art of ongcCompany.articles) {
      console.log(`- Article ID: ${art.id}`);
      console.log(`  Title: ${art.title}`);
      console.log(`  Status: ${art.status}`);
      console.log(`  CategoryId: ${art.categoryId}`);
      console.log(`  Category Name: ${art.category?.name || "NONE"}`);
      console.log(`  Category Slug: ${art.category?.slug || "NONE"}`);
      console.log(`  Category Parent: ${art.category?.parent?.name || "NONE"}`);
    }
  }

  console.log("\n=== 2. AUDIT ALL ARTICLES LINKED TO COMPANIES ===");
  const allArticlesWithCompany = await prisma.article.findMany({
    where: {
      companyId: { not: null },
    },
    include: {
      company: true,
      category: {
        include: {
          parent: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Total articles with companyId: ${allArticlesWithCompany.length}`);
  for (const art of allArticlesWithCompany) {
    console.log(`--------------------------------------------------`);
    console.log(`Article: "${art.title}" (ID: ${art.id})`);
    console.log(`Company: ${art.company?.name} (Sector: ${art.company?.sector})`);
    console.log(`Category: ${art.category ? `${art.category.name} [Parent: ${art.category.parent?.name || "None"}, Slug: ${art.category.slug}]` : "❌ NO CATEGORY ASSIGNED"}`);
  }

  console.log("\n=== 3. ALL SECTORS / CATEGORIES IN DB ===");
  const categories = await prisma.category.findMany({
    include: { parent: true },
    orderBy: { name: "asc" },
  });
  for (const c of categories) {
    console.log(`Category: ${c.name} (slug: ${c.slug}, parent: ${c.parent?.name || "None"})`);
  }

  console.log("\n=== 4. ALL COMPANIES AND THEIR SECTORS ===");
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  });
  for (const comp of companies) {
    console.log(`Company: ${comp.name} | Sector: "${comp.sector}"`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
