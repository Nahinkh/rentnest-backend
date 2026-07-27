import { Router } from "express";
import { tenantController } from "./tenant.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const route = Router();

route.post("/",auth(), tenantController.createRentalRequest);
route.get("/",auth(), tenantController.getRentalRequestsByTenant);
route.get("/property-request",auth(Role.LANDLORD), tenantController.getPropertyRequest);
route.patch("/:id/approve",auth(Role.LANDLORD), tenantController.approveRentalRequest);


export const tenantRoute = route;