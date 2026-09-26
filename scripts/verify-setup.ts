import prisma from "../lib/prisma";

async function main() {
  const sectors = await prisma.category.findFirst({
    where: { slug: "sectors" },
    include: {
      children: {
        orderBy: [{ order: "asc" }, { name: "asc" }],
      },
    },
  });

  console.log("SECTORS PARENT:", sectors?.name, "ID:", sectors?.id);
  console.log("SECTORS CHILDREN:");
  for (const c of sectors?.children || []) {
    console.log(`  - ${c.name} (/${c.slug}) [order: ${c.order}]`);
  }

  const oilGasArticles = await prisma.article.findMany({
    where: {
      category: { slug: "oil-gas" },
    },
    include: {
      category: {
        include: { parent: true },
      },
    },
  });

  console.log("\nARTICLES IN OIL & GAS:");
  for (const a of oilGasArticles) {
    console.log(`  - [${a.id}] "${a.title}"`);
    console.log(`    Category: ${a.category?.name} (Parent: ${a.category?.parent?.name})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
