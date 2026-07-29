import { Router } from "express";
import { propertyController } from "./property.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const route = Router();

// Land Lord Routes
route.post("/",auth(Role.LANDLORD), propertyController.createProperty);
route.patch("/:id",auth(Role.LANDLORD), propertyController.updateProperty);
route.delete("/:id",auth(Role.LANDLORD), propertyController.deleteProperty);
// 
route.get("/",auth(), propertyController.getAllProperties);
route.get("/:id",auth(), propertyController.getPropertyById);

export const propertyRoute = route;