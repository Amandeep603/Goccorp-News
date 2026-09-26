import prisma from "../lib/prisma";

async function main() {
  console.log("=== 1. ENSURE TOP-LEVEL PARENT CATEGORIES ===");

  const topLevelNav = [
    { name: "Home", slug: "home", order: 0 },
    { name: "Companies", slug: "companies", order: 1 },
    { name: "Market", slug: "market", order: 2 },
    { name: "International", slug: "international", order: 3 },
    { name: "Sectors", slug: "sectors", order: 4 },
    { name: "Appointments", slug: "appointments", order: 5 },
    { name: "Jobs", slug: "jobs", order: 6 },
    { name: "Government", slug: "government", order: 7 },
    { name: "Analysis", slug: "analysis", order: 8 },
    { name: "More", slug: "more", order: 9 },
  ];

  const parentMap = new Map<string, string>(); // slug -> id

  for (const parent of topLevelNav) {
    let existing = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: parent.slug },
          { name: { equals: parent.name, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      existing = await prisma.category.update({
        where: { id: existing.id },
        data: {
          name: parent.name,
          slug: parent.slug,
          parentId: null,
          order: parent.order,
        },
      });
      console.log(`Updated top-level: ${existing.name} (${existing.slug}) [ID: ${existing.id}]`);
    } else {
      existing = await prisma.category.create({
        data: {
          name: parent.name,
          slug: parent.slug,
          parentId: null,
          order: parent.order,
        },
      });
      console.log(`Created top-level: ${existing.name} (${existing.slug}) [ID: ${existing.id}]`);
    }
    parentMap.set(parent.slug, existing.id);
  }

  console.log("\n=== 2. SEED SUB-CATEGORIES ===");

  const subCategoriesData: {
    parentSlug: string;
    items: { name: string; slug: string; order: number }[];
  }[] = [
    {
      parentSlug: "companies",
      items: [
        { name: "PSUs (Maharatna & Navratna)", slug: "psus", order: 1 },
        { name: "Private Corporates", slug: "private-corporates", order: 2 },
        { name: "Boardroom & Governance", slug: "governance", order: 3 },
        { name: "Quarterly Results", slug: "quarterly-results", order: 4 },
        { name: "Mergers & Acquisitions", slug: "mergers-acquisitions", order: 5 },
      ],
    },
    {
      parentSlug: "market",
      items: [
        { name: "BSE / NSE Updates", slug: "bse-nse", order: 1 },
        { name: "PSU Stocks Index", slug: "psu-stocks", order: 2 },
        { name: "Commodities & Energy", slug: "commodities", order: 3 },
        { name: "Rupee / Dollar Tracker", slug: "currencies", order: 4 },
      ],
    },
    {
      parentSlug: "sectors",
      items: [
        { name: "Defence & Aerospace", slug: "defence", order: 1 },
        { name: "Oil & Gas", slug: "oil-gas", order: 2 },
        { name: "Power & Energy", slug: "power", order: 3 },
        { name: "Banking & Financial Services", slug: "banking", order: 4 },
        { name: "Infrastructure & Railways", slug: "infrastructure", order: 5 },
        { name: "Metals & Mining", slug: "metals-mining", order: 6 },
        { name: "Telecom & Technology", slug: "telecom", order: 7 },
        { name: "Aviation & Shipping", slug: "aviation", order: 8 },
        { name: "Healthcare & Pharma", slug: "healthcare", order: 9 },
      ],
    },
    {
      parentSlug: "government",
      items: [
        { name: "Policy Decisions", slug: "policy", order: 1 },
        { name: "Cabinet Approvals", slug: "cabinet", order: 2 },
        { name: "Ministry of Finance", slug: "finance", order: 3 },
        { name: "States Updates", slug: "states", order: 4 },
      ],
    },
    {
      parentSlug: "more",
      items: [
        { name: "Awards", slug: "awards", order: 1 },
        { name: "Interviews", slug: "interviews", order: 2 },
        { name: "Events", slug: "events", order: 3 },
      ],
    },
  ];

  for (const group of subCategoriesData) {
    const parentId = parentMap.get(group.parentSlug);
    if (!parentId) continue;

    for (const item of group.items) {
      let sub = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: item.slug },
            { name: { equals: item.name, mode: "insensitive" } },
          ],
        },
      });

      if (sub) {
        sub = await prisma.category.update({
          where: { id: sub.id },
          data: {
            name: item.name,
            slug: item.slug,
            parentId: parentId,
            order: item.order,
          },
        });
        console.log(`Updated sub-category: ${sub.name} -> Parent: ${group.parentSlug}`);
      } else {
        sub = await prisma.category.create({
          data: {
            name: item.name,
            slug: item.slug,
            parentId: parentId,
            order: item.order,
          },
        });
        console.log(`Created sub-category: ${sub.name} -> Parent: ${group.parentSlug}`);
      }
    }
  }

  console.log("\n=== 3. DATA CLEANUP: OIL & GAS COMPANY ENTITY ===");
  // Ensure "Oil & Gas" category under Sectors exists
  const sectorsId = parentMap.get("sectors")!;
  let oilGasCategory = await prisma.category.findFirst({
    where: {
      slug: "oil-gas",
      parentId: sectorsId,
    },
  });

  if (!oilGasCategory) {
    oilGasCategory = await prisma.category.create({
      data: {
        name: "Oil & Gas",
        slug: "oil-gas",
        parentId: sectorsId,
        order: 2,
      },
    });
    console.log("Created missing Oil & Gas category under Sectors");
  }

  // Find any company named "Oil and Gas" or "Oil and Natural Gas Corporation"
  const problematicCompanies = await prisma.company.findMany({
    where: {
      OR: [
        { name: { contains: "Oil and Gas", mode: "insensitive" } },
        { name: { contains: "Oil & Gas", mode: "insensitive" } },
        { name: { contains: "Oil and Natural Gas", mode: "insensitive" } },
      ],
    },
    include: {
      articles: true,
    },
  });

  for (const comp of problematicCompanies) {
    console.log(`Found company entity to clean up: "${comp.name}" (ID: ${comp.id}) with ${comp.articles.length} articles`);

    // Re-point articles to Oil & Gas sub-category
    for (const art of comp.articles) {
      await prisma.article.update({
        where: { id: art.id },
        data: {
          categoryId: oilGasCategory.id,
          companyId: null, // decouple from company entity
        },
      });
      console.log(`Re-pointed article [${art.id}] "${art.title}" to Category "${oilGasCategory.name}"`);
    }

    // Delete company entity
    await prisma.company.delete({
      where: { id: comp.id },
    });
    console.log(`Deleted company entity "${comp.name}" (ID: ${comp.id})`);
  }

  console.log("\n✅ All categories seeded, ordered, and data cleanup complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
