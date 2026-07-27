import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export async function createParent(
  req: Request,
  res: Response
) {
  const {
    full_name,
    primary_phone,
    secondary_phone,
  } = req.body;

  const { data, error } = await supabase
    .from("parents")
    .insert([
      {
        full_name,
        primary_phone,
        secondary_phone,
      },
    ])
    .select();

  if (error) {
    return res.status(400).json(error);
  }

  return res.status(201).json(data);
}