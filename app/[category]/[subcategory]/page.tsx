import { Metadata } from "next";
import CategoryPage, { generateMetadata as generateCategoryMetadata } from "../page";

export const revalidate = 60;

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SubcategoryPageProps): Promise<Metadata> {
  const { subcategory } = await params;
  return generateCategoryMetadata({
    params: Promise.resolve({ category: subcategory }),
    searchParams,
  });
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
