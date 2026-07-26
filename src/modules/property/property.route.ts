import { Router } from "express";
import { propertyController } from "./property.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const route = Router();

route.post("/",auth(Role.LANDLORD), propertyController.createProperty);
route.get("/",auth(), propertyController.getAllProperties);
route.get("/:id",auth(), propertyController.getPropertyById);

export const propertyRoute = route;