import { Router } from "express";
import { propertyController } from "./property.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const route = Router();

route.post("/",auth(Role.LANDLORD), propertyController.createProperty);

export const propertyRoute = route;