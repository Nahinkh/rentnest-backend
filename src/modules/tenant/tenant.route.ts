import { Router } from "express";
import { tenantController } from "./tenant.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const route = Router();

// Tenant Routes
route.post("/",auth(Role.TENANT), tenantController.createRentalRequest);
route.get("/",auth(Role.TENANT), tenantController.getRentalRequestsByTenant);
route.get("/current-rental",auth(Role.TENANT), tenantController.getCurrentRental);
// Landlord Routes
route.get("/property-request",auth(Role.LANDLORD), tenantController.getPropertyRequest);
route.patch("/:id/approve",auth(Role.LANDLORD), tenantController.approveRentalRequest);
route.patch("/:id/reject",auth(Role.LANDLORD), tenantController.rejectRentalRequest);
route.patch("/:id/cancel",auth(Role.TENANT), tenantController.cancelRentalRequest);


export const tenantRoute = route;