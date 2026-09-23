import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const password = "AdminPassword123!";
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@govcorpnews.com" },
    update: {
      password: hashedPassword,
      mustChangePassword: false,
    },
    create: {
      email: "admin@govcorpnews.com",
      password: hashedPassword,
      name: "Admin",
      role: "super_admin",
      mustChangePassword: false,
    },
  });

  console.log("Admin password updated successfully for:", admin.email);
  console.log("Password:", password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
