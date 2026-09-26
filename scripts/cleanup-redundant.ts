import prisma from "../lib/prisma";

async function main() {
  const redundant = ["railways", "steel"];
  for (const slug of redundant) {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { articles: true } } },
    });
    if (cat && cat._count.articles === 0) {
      await prisma.category.delete({ where: { id: cat.id } });
      console.log(`Removed empty redundant category: ${cat.name} (${cat.slug})`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
