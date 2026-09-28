import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";

const route = Router();

route.get(
  "/dashboard-stats",
  auth(Role.ADMIN),
  adminController.getDashboardStats,
);
route.get("/users", auth(Role.ADMIN), adminController.getAllUsersByAdmin);
route.patch(
  "/users/:userId/status",
  auth(Role.ADMIN),
  adminController.updateUserStatusByAdmin,
);
route.get(
  "/properties",
  auth(Role.ADMIN),
  adminController.getAllPropertiesByAdmin,
);
route.get(
  "/rental-requests",
  auth(Role.ADMIN),
  adminController.getAllRentalRequestsByAdmin,
);
route.get(
  "/landlord-applications",
  auth(Role.ADMIN),
  adminController.getLandlordApplications,
);
route.patch(
  "/landlord-applications/:applicationId",
  auth(Role.ADMIN),
  adminController.reviewLandlordApplication,
);
route.get(
  "/landlord-applications/history",
  auth(Role.ADMIN),
  adminController.getLandlordApplicationHistory,
);
export const adminRoute = route;
