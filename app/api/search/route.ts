import { NextResponse } from "next/server";
import { executeSearch } from "@/lib/search";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const result = await executeSearch({ q, page, limit });

    return NextResponse.json({
      success: true,
      query: q,
      ...result,
    });
  } catch (error) {
    console.error("[API_SEARCH_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to execute search." },
      { status: 500 }
    );
  }
}
