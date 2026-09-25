import type { Metadata } from "next";
import CategoryPage from "../page";
import prisma from "@/lib/prisma";

export const revalidate = 60;

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { category: rawCategory, subcategory: rawSubcategory } = await params;
  const categorySlug = decodeURIComponent(rawCategory).toLowerCase().trim();
  const subcategorySlug = decodeURIComponent(rawSubcategory).toLowerCase().trim();

  const subcategory = await prisma.category.findFirst({
    where: { slug: subcategorySlug },
  });

  const titleText =
    subcategory?.name ||
    subcategorySlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const title = `${titleText} News | GovCorp News`;
  const description = `Latest reporting, developments, and policy updates in ${titleText} on GovCorp News.`;
  const canonicalUrl = `/${categorySlug}/${subcategorySlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "GovCorp News",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: `${titleText} News | GovCorp News`,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  };
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const { subcategory } = await params;
  return CategoryPage({
    params: Promise.resolve({ category: subcategory }),
    searchParams,
  });
}
