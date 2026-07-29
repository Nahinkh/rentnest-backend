import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";

const route = Router();

route.get("/users",auth(Role.ADMIN),adminController.getAllUsersByAdmin);
route.patch("/users/:userId/status",auth(Role.ADMIN),adminController.updateUserStatusByAdmin);
route.get("/properties",auth(Role.ADMIN),adminController.getAllPropertiesByAdmin);
route.get("/rental-requests",auth(Role.ADMIN),adminController.getAllRentalRequestsByAdmin);

export const adminRoute = route;