import prisma from "../lib/prisma";

async function main() {
  const articles = await prisma.article.findMany({
    include: {
      company: true,
      category: {
        include: { parent: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Total articles in DB: ${articles.length}`);
  for (const a of articles) {
    console.log(`- [${a.status}] "${a.title}"`);
    console.log(`  Company: ${a.company ? `${a.company.name} (Sector: ${a.company.sector})` : "None"}`);
    console.log(`  Category: ${a.category ? `${a.category.name} (Parent: ${a.category.parent?.name || "None"}, Slug: ${a.category.slug})` : "None"}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
