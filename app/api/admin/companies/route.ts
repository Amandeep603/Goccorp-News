import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/validations/article";
import { validateAdminSession } from "@/lib/auth";

// GET /api/admin/companies - List all companies
export async function GET() {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, companies });
  } catch (error) {
    console.error("[API_GET_COMPANIES_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while retrieving companies." },
      { status: 500 }
    );
  }
}

// POST /api/admin/companies - Create a company
export async function POST(req: Request) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const body = await req.json();
    const { name, sector, logoUrl } = body;
    let slug = body.slug ? generateSlug(body.slug) : "";

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Company name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!slug) {
      slug = generateSlug(name);
    }

    // Check slug uniqueness
    const existing = await prisma.company.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A company with slug "${slug}" already exists.` },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        slug,
        sector: sector && sector.trim() !== "" ? sector.trim() : null,
        logoUrl: logoUrl && logoUrl.trim() !== "" ? logoUrl.trim() : null,
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    revalidatePath("/admin/companies");
    revalidatePath("/(public)", "layout");

    return NextResponse.json(
      { success: true, company, message: "Company created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API_POST_COMPANY_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while creating company." },
      { status: 500 }
    );
  }
}
