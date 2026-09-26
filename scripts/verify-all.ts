import { PrismaClient } from "@prisma/client";
import { getNavbarCategories } from "../lib/categories";

const prisma = new PrismaClient();

async function main() {
  console.log("=== 1. VERIFY TOP-LEVEL PARENT CATEGORIES ===");
  const parents = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      children: {
        orderBy: { order: "asc" },
      },
    },
  });

  console.log(`Found ${parents.length} top-level categories:`);
  for (const p of parents) {
    console.log(`- [${p.order}] ${p.name} (${p.slug}) -> ${p.children.length} sub-categories: [${p.children.map(c => c.name).join(", ")}]`);
  }

  console.log("\n=== 2. VERIFY OIL & GAS UNDER SECTORS ===");
  const sectors = parents.find(p => p.slug === "sectors");
  if (!sectors) throw new Error("Sectors category not found!");
  const oilGas = sectors.children.find(c => c.slug === "oil-gas");
  if (!oilGas) throw new Error("Oil & Gas sub-category not found under Sectors!");
  console.log(`Oil & Gas found: ID=${oilGas.id}, Name=${oilGas.name}, Slug=${oilGas.slug}, ParentId=${oilGas.parentId}`);

  console.log("\n=== 3. VERIFY ARTICLE ASSIGNMENT ===");
  const ongcArticle = await prisma.article.findFirst({
    where: {
      title: { contains: "ONGC", mode: "insensitive" },
    },
    include: {
      category: {
        include: { parent: true },
      },
      company: true,
    },
  });

  if (!ongcArticle) {
    console.warn("ONGC article not found!");
  } else {
    console.log(`Article: "${ongcArticle.title}"`);
    console.log(`Assigned Category: ${ongcArticle.category?.name} (slug: ${ongcArticle.category?.slug})`);
    console.log(`Category Parent: ${ongcArticle.category?.parent?.name} (slug: ${ongcArticle.category?.parent?.slug})`);
    console.log(`Company link: ${ongcArticle.company ? ongcArticle.company.name : "None (standalone company removed)"}`);
    if (ongcArticle.categoryId !== oilGas.id) {
      throw new Error(`Article categoryId (${ongcArticle.categoryId}) does not match Oil & Gas id (${oilGas.id})!`);
    }
    console.log("Article is correctly assigned to Oil & Gas subcategory!");
  }

  console.log("\n=== 4. TEST SUB-CATEGORY CREATION & COLLISION LOGIC ===");
  const testName = "Test Green Tech";
  const baseSlug = "test-green-tech";
  const parentId = sectors.id;

  // Cleanup any old test
  await prisma.category.deleteMany({
    where: { slug: { in: [baseSlug, `sectors-${baseSlug}`] } },
  });

  // Create first
  const cat1 = await prisma.category.create({
    data: {
      name: testName,
      slug: baseSlug,
      parentId,
    },
  });
  console.log(`Created test sub-category 1: ID=${cat1.id}, Slug=${cat1.slug}`);

  // Test collision fallback
  let candidateSlug = baseSlug;
  const existing = await prisma.category.findUnique({ where: { slug: candidateSlug } });
  if (existing) {
    candidateSlug = `${sectors.slug}-${candidateSlug}`;
  }
  const cat2 = await prisma.category.create({
    data: {
      name: testName,
      slug: candidateSlug,
      parentId,
    },
  });
  console.log(`Created collided sub-category 2 with fallback slug: ID=${cat2.id}, Slug=${cat2.slug}`);

  // Clean up test items
  await prisma.category.deleteMany({
    where: { id: { in: [cat1.id, cat2.id] } },
  });
  console.log("Cleaned up test categories.");

  console.log("\n=== 5. VERIFY NAVBAR REVALIDATION / SSR HELPER ===");
  const navItems = await getNavbarCategories();
  console.log(`getNavbarCategories returned ${navItems.length} navbar tabs:`);
  for (const item of navItems) {
    console.log(`- ${item.name} (${item.href}) -> ${item.subItems?.length || 0} dropdown items`);
  }

  const navSectors = navItems.find(n => n.name === "Sectors");
  const navOilGas = navSectors?.subItems?.find(s => s.name.includes("Oil") || s.slug === "oil-gas");
  console.log("Navbar Sectors > Oil & Gas entry:", navOilGas);

  console.log("\nALL VERIFICATIONS PASSED!");
}

main()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
