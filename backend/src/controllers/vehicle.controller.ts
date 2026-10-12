import type {
  Request,
  Response,
} from "express";

import {
  supabase,
} from "../config/supabase.js";

export async function getVehicles(
  _req: Request,
  res: Response,
): Promise<void> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "vehicles",
      )
      .select(`
        id,
        registration_number,
        make,
        model,
        year,
        capacity,
        active,
        notes,
        created_at,
        updated_at
      `)
      .order(
        "registration_number",
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

export async function getActiveVehicles(
  _req: Request,
  res: Response,
): Promise<void> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "vehicles",
      )
      .select(`
        id,
        registration_number,
        make,
        model,
        year,
        capacity,
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
        "registration_number",
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

export async function createVehicle(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    registration_number,
    make,
    model,
    year,
    capacity,
    active,
    notes,
  } =
    req.body ?? {};

  if (
    typeof registration_number !==
      "string" ||
    !registration_number.trim()
  ) {
    res
      .status(400)
      .json({
        error:
          "registration_number is required.",
      });

    return;
  }

  if (
    typeof capacity !==
      "number" ||
    capacity <= 0
  ) {
    res
      .status(400)
      .json({
        error:
          "capacity must be a positive number.",
      });

    return;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "vehicles",
      )
      .insert({
        registration_number:
          registration_number
            .trim()
            .toUpperCase(),

        make:
          typeof make ===
            "string" &&
          make.trim()
            ? make.trim()
            : null,

        model:
          typeof model ===
            "string" &&
          model.trim()
            ? model.trim()
            : null,

        year:
          typeof year ===
            "number"
            ? year
            : null,

        capacity,

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
        registration_number,
        make,
        model,
        year,
        capacity,
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