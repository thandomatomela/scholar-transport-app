import type {
  Request,
  Response,
} from "express";

import {
  supabase,
} from "../config/supabase.js";

export async function getDrivers(
  _req: Request,
  res: Response,
): Promise<void> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "drivers",
      )
      .select(`
        id,
        full_name,
        phone,
        active,
        created_at
      `)
      .order(
        "full_name",
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

export async function getActiveDrivers(
  _req: Request,
  res: Response,
): Promise<void> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "drivers",
      )
      .select(`
        id,
        full_name,
        phone,
        active,
        created_at
      `)
      .eq(
        "active",
        true,
      )
      .order(
        "full_name",
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

export async function createDriver(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    full_name,
    phone,
    active,
  } =
    req.body ?? {};

  if (
    typeof full_name !==
      "string" ||
    !full_name.trim()
  ) {
    res
      .status(400)
      .json({
        error:
          "full_name is required.",
      });

    return;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "drivers",
      )
      .insert({
        full_name:
          full_name.trim(),

        phone:
          typeof phone ===
            "string" &&
          phone.trim()
            ? phone.trim()
            : null,

        active:
          typeof active ===
          "boolean"
            ? active
            : true,
      })
      .select(`
        id,
        full_name,
        phone,
        active,
        created_at
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