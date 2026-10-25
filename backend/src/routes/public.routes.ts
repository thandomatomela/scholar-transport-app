import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import {
  createPublicEnquiry,
} from "../controllers/public-enquiry.controller.js";

const router =
  Router();

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const submissions =
  new Map<
    string,
    RateLimitEntry
  >();

const WINDOW_MS =
  15 * 60 * 1000;

const MAX_SUBMISSIONS =
  5;

function publicEnquiryRateLimit(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const now =
    Date.now();

  const key =
    request.ip ||
    request.socket
      .remoteAddress ||
    "unknown";

  const existing =
    submissions.get(key);

  if (
    !existing ||
    now >=
      existing.resetAt
  ) {
    submissions.set(
      key,
      {
        count: 1,
        resetAt:
          now +
          WINDOW_MS,
      },
    );

    next();
    return;
  }

  if (
    existing.count >=
    MAX_SUBMISSIONS
  ) {
    response.status(429).json({
      success: false,
      error:
        "Too many enquiry submissions. Please try again later.",
    });

    return;
  }

  existing.count += 1;

  submissions.set(
    key,
    existing,
  );

  next();
}

router.post(
  "/enquiries",
  publicEnquiryRateLimit,
  createPublicEnquiry,
);

export default router;