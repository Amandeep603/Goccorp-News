import prisma from "../lib/prisma";

async function main() {
  const cats = await prisma.category.findMany({
    include: {
      parent: true,
      children: true,
    },
    orderBy: { name: "asc" },
  });
  console.log("Categories in DB:");
  for (const c of cats) {
    console.log(`- ${c.name} (${c.slug}) [ID: ${c.id}] Parent: ${c.parent?.name || "None"}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
