import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/validations/article";
import { validateAdminSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/companies/[id] - Update company
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const existing = await prisma.company.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

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

    if (slug !== existing.slug) {
      const slugConflict = await prisma.company.findUnique({
        where: { slug },
      });
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { error: `A company with slug "${slug}" already exists.` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        sector: sector !== undefined ? (sector && sector.trim() !== "" ? sector.trim() : null) : existing.sector,
        logoUrl: logoUrl !== undefined ? (logoUrl && logoUrl.trim() !== "" ? logoUrl.trim() : null) : existing.logoUrl,
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    revalidatePath("/admin/companies");
    revalidatePath("/(public)", "layout");

    return NextResponse.json({
      success: true,
      company: updated,
      message: "Company updated successfully.",
    });
  } catch (error) {
    console.error("[API_PUT_COMPANY_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while updating company." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/companies/[id] - Delete company
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { authorized, errorResponse } = await validateAdminSession();
    if (!authorized) return errorResponse!;

    const { id } = await params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    // Unlink companyId from articles to avoid dangling references
    if (company._count.articles > 0) {
      await prisma.article.updateMany({
        where: { companyId: id },
        data: { companyId: null },
      });
    }

    await prisma.company.delete({
      where: { id },
    });

    revalidatePath("/admin/companies");
    revalidatePath("/(public)", "layout");

    return NextResponse.json({
      success: true,
      message: `Company "${company.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("[API_DELETE_COMPANY_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting company." },
      { status: 500 }
    );
  }
}
