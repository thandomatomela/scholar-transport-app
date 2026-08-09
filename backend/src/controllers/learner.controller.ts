import type {
  Request,
  Response,
} from "express";

import { supabase } from "../config/supabase.js";

export async function getLearners(
  _req: Request,
  res: Response,
) {
  const { data, error } =
    await supabase
      .from("learners")
      .select(`
        id,
        full_name,
        school_name,
        parent_id
      `)
      .order(
        "full_name",
        {
          ascending: true,
        },
      );

  if (error) {
    return res.status(500).json({
      error:
        error.message,
    });
  }

  return res.status(200).json({
    data:
      data ?? [],
  });
}

export async function createLearner(
  req: Request,
  res: Response,
) {
  const {
    full_name,
    parent_id,
    school_name,
  } =
    req.body ?? {};

  if (
    !full_name ||
    !parent_id
  ) {
    return res.status(400).json({
      error:
        "full_name and parent_id are required",
    });
  }

  const { data, error } =
    await supabase
      .from("learners")
      .insert({
        full_name,
        parent_id,
        school_name:
          school_name || null,
      })
      .select(`
        id,
        full_name,
        school_name,
        parent_id
      `)
      .single();

  if (error) {
    return res.status(400).json({
      error:
        error.message,
    });
  }

  return res.status(201).json({
    data,
  });
}