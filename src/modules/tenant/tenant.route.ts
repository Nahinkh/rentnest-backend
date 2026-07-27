import { Router } from "express";
import { tenantController } from "./tenant.controller";
import auth from "../../middleware/auth";

const route = Router();

route.post("/",auth(), tenantController.createRentalRequest);

export const tenantRoute = route;