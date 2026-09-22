import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { validateAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const auth = await validateAdminSession();
    if (!auth.authorized || !auth.session?.user?.email) {
      return auth.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = auth.session;

    const { newPassword } = await req.json();

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.adminUser.update({
      where: { email: session.user.email },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to update password. Please try again." },
      { status: 500 }
    );
  }
}
