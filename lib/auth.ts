import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const ALLOWED_ADMIN_ROLES = ["super_admin", "admin", "editor"];

export interface SessionValidationResult {
  authorized: boolean;
  errorResponse: NextResponse | null;
  session: any;
}

/**
 * Validates that an active authenticated session exists AND has an authorized role.
 * Returns { authorized: true, session } or { authorized: false, errorResponse }.
 */
export async function validateAdminSession(
  allowedRoles: string[] = ALLOWED_ADMIN_ROLES
): Promise<SessionValidationResult> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Unauthorized. Please sign in to access this resource." },
        { status: 401 }
      ),
      session: null,
    };
  }

  const userRole = (session.user as { role?: string }).role || "editor";

  if (!allowedRoles.includes(userRole)) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Forbidden. Your role does not have permission for this operation." },
        { status: 403 }
      ),
      session,
    };
  }

  return {
    authorized: true,
    errorResponse: null,
    session,
  };
}
