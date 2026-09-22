import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateRandomPassword(length = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("\n🌱 Starting database seeding...\n");

  // 1. Seed Admin User
  const adminEmail = "admin@govcorpnews.com";
  const plaintextPassword = generateRandomPassword(12);
  const hashedPassword = await bcrypt.hash(plaintextPassword, 12);

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    await prisma.adminUser.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        name: "Admin",
        role: "super_admin",
        mustChangePassword: true,
      },
    });
    console.log("ℹ️  Existing AdminUser updated with fresh credentials.");
  } else {
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin",
        role: "super_admin",
        mustChangePassword: true,
      },
    });
    console.log("✅ AdminUser created successfully.");
  }

  console.log("\n==================================================");
  console.log("🔑 ADMIN CREDENTIALS (SAVE THIS PASSWORD NOW):");
  console.log("   Email:    " + adminEmail);
  console.log("   Password: " + plaintextPassword);
  console.log("==================================================\n");

  // 2. Seed Base Categories
  const categoryStructure = [
    { name: "Companies" },
    { name: "Market" },
    { name: "International" },
    {
      name: "Sectors",
      children: [
        "Power",
        "Oil & Gas",
        "Defence",
        "Telecom",
        "Railways",
        "Steel",
        "Aviation",
      ],
    },
    { name: "Appointments" },
    { name: "Jobs" },
    {
      name: "Government",
      children: ["States", "Policies"],
    },
    { name: "Analysis" },
    {
      name: "More",
      children: ["Awards", "Interviews", "Events"],
    },
  ];

  console.log("📁 Seeding categories...");

  for (const cat of categoryStructure) {
    const parentSlug = slugify(cat.name);
    const parentCategory = await prisma.category.upsert({
      where: { slug: parentSlug },
      update: { name: cat.name },
      create: {
        name: cat.name,
        slug: parentSlug,
      },
    });

    console.log(`  ✓ Category: ${parentCategory.name} (/${parentCategory.slug})`);

    if (cat.children && cat.children.length > 0) {
      for (const childName of cat.children) {
        const childSlug = slugify(childName);
        const childCategory = await prisma.category.upsert({
          where: { slug: childSlug },
          update: {
            name: childName,
            parentId: parentCategory.id,
          },
          create: {
            name: childName,
            slug: childSlug,
            parentId: parentCategory.id,
          },
        });
        console.log(`    ↳ Subcategory: ${childCategory.name} (/${childCategory.slug})`);
      }
    }
  }

  console.log("\n🎉 Seeding completed successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
