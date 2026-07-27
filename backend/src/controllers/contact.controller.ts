import type { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export async function createContact(req: Request, res: Response) {
  const {
    full_name,
    phone_number,
    relationship,
    whatsapp_enabled,
  } = req.body ?? {};

  if (!full_name || !phone_number) {
    return res.status(400).json({
      error: "full_name and phone_number are required",
    });
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      full_name,
      phone_number,
      relationship: relationship || null,
      whatsapp_enabled: whatsapp_enabled ?? true,
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  return res.status(201).json(data);
}

export async function linkContactToLearner(
  req: Request,
  res: Response,
) {
  const {
    learner_id,
    contact_id,
    notification_priority,
    receive_pickup_notifications,
    receive_tracking_link,
    receive_dropoff_notifications,
  } = req.body ?? {};

  if (!learner_id || !contact_id) {
    return res.status(400).json({
      error: "learner_id and contact_id are required",
    });
  }

  const { data, error } = await supabase
    .from("learner_contacts")
    .insert({
      learner_id,
      contact_id,
      notification_priority: notification_priority ?? 1,
      receive_pickup_notifications:
        receive_pickup_notifications ?? true,
      receive_tracking_link:
        receive_tracking_link ?? true,
      receive_dropoff_notifications:
        receive_dropoff_notifications ?? true,
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  return res.status(201).json(data);
}