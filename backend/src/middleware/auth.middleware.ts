import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  supabase,
} from "../config/supabase.js";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  role: "admin" | "driver";
  fullName: string | null;
};

export interface AuthenticatedRequest
  extends Request {
  user?: AuthenticatedUser;
}

export async function requireAuth(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorization =
      request.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer ",
      )
    ) {
      response.status(401).json({
        success: false,
        error:
          "Authentication required",
      });

      return;
    }

    const token =
      authorization.substring(
        "Bearer ".length,
      );

    const {
      data: userData,
      error: userError,
    } =
      await supabase.auth.getUser(
        token,
      );

    if (
      userError ||
      !userData.user
    ) {
      response.status(401).json({
        success: false,
        error:
          "Invalid or expired token",
      });

      return;
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        "full_name, role",
      )
      .eq(
        "id",
        userData.user.id,
      )
      .single();

    if (
      profileError ||
      !profile
    ) {
      response.status(403).json({
        success: false,
        error:
          "User profile not configured",
      });

      return;
    }

    if (
      profile.role !==
        "admin" &&
      profile.role !==
        "driver"
    ) {
      response.status(403).json({
        success: false,
        error:
          "Invalid user role",
      });

      return;
    }

    request.user = {
      id: userData.user.id,
      email:
        userData.user.email ??
        null,
      role: profile.role,
      fullName:
        profile.full_name ??
        null,
    };

    next();
  } catch (error) {
    console.error(
      "Authentication failed:",
      error,
    );

    response.status(500).json({
      success: false,
      error:
        "Authentication failed",
    });
  }
}

export function requireAdmin(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
): void {
  if (
    !request.user ||
    request.user.role !==
      "admin"
  ) {
    response.status(403).json({
      success: false,
      error:
        "Admin access required",
    });

    return;
  }

  next();
}