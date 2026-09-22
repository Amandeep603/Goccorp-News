import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const authors = await prisma.author.findMany();
  console.log(`Found ${authors.length} authors in database:`);
  
  for (const author of authors) {
    const slug = author.slug || slugify(author.name) || `author-${author.id}`;
    console.log(`- Author: "${author.name}", current slug: "${author.slug}", setting to: "${slug}"`);
    await prisma.author.update({
      where: { id: author.id },
      data: { slug },
    });
  }

  console.log("Author slugs updated successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
