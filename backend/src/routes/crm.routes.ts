import {
  Router,
} from "express";

import {
  createCrmEnquiryController,
  createCrmFollowupController,
  createCrmQuoteController,
  getCrmEnquiry,
  listCrmEnquiries,
  updateCrmEnquiryController,
} from "../controllers/crm.controller.js";

import {
  requireAdmin,
  requireAuth,
} from "../middleware/auth.middleware.js";

const router =
  Router();

router.use(
  requireAuth,
  requireAdmin,
);

router.get(
  "/enquiries",
  listCrmEnquiries,
);

router.post(
  "/enquiries",
  createCrmEnquiryController,
);

router.get(
  "/enquiries/:id",
  getCrmEnquiry,
);

router.patch(
  "/enquiries/:id",
  updateCrmEnquiryController,
);

router.post(
  "/enquiries/:id/quotes",
  createCrmQuoteController,
);

router.post(
  "/enquiries/:id/followups",
  createCrmFollowupController,
);

export default router;