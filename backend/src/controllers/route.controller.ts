import type {
  Request,
  Response,
} from "express";

import {
  supabase,
} from "../config/supabase.js";

export async function getRoutes(
  _req: Request,
  res: Response,
): Promise<void> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "routes",
      )
      .select(`
        id,
        name,
        direction,
        active,
        notes,
        created_at,
        updated_at
      `)
      .order(
        "name",
        {
          ascending: true,
        },
      );

  if (error) {
    res
      .status(500)
      .json({
        error:
          error.message,
      });

    return;
  }

  res
    .status(200)
    .json({
      data:
        data ?? [],
    });
}

export async function getActiveRoutes(
  _req: Request,
  res: Response,
): Promise<void> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "routes",
      )
      .select(`
        id,
        name,
        direction,
        active,
        notes,
        created_at,
        updated_at
      `)
      .eq(
        "active",
        true,
      )
      .order(
        "name",
        {
          ascending: true,
        },
      );

  if (error) {
    res
      .status(500)
      .json({
        error:
          error.message,
      });

    return;
  }

  res
    .status(200)
    .json({
      data:
        data ?? [],
    });
}

export async function createRoute(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    name,
    direction,
    active,
    notes,
  } =
    req.body ?? {};

  if (
    typeof name !==
      "string" ||
    !name.trim()
  ) {
    res
      .status(400)
      .json({
        error:
          "name is required.",
      });

    return;
  }

  const validDirections = [
    "home_to_school",
    "school_to_home",
    "both",
  ];

  if (
    direction !== undefined &&
    direction !== null &&
    !validDirections.includes(
      direction,
    )
  ) {
    res
      .status(400)
      .json({
        error:
          "direction must be home_to_school, school_to_home, or both.",
      });

    return;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "routes",
      )
      .insert({
        name:
          name.trim(),

        direction:
          direction ??
          null,

        active:
          typeof active ===
          "boolean"
            ? active
            : true,

        notes:
          typeof notes ===
            "string" &&
          notes.trim()
            ? notes.trim()
            : null,

        updated_at:
          new Date()
            .toISOString(),
      })
      .select(`
        id,
        name,
        direction,
        active,
        notes,
        created_at,
        updated_at
      `)
      .single();

  if (error) {
    res
      .status(400)
      .json({
        error:
          error.message,
      });

    return;
  }

  res
    .status(201)
    .json({
      data,
    });
}