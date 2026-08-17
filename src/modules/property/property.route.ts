import { Router } from "express";
import { propertyController } from "./property.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { uploadImages } from "../../middleware/upload.middleware";

const route = Router();

// Land Lord Routes
route.post(
  "/",
  auth(Role.LANDLORD),
  uploadImages.array("images", 10),
  propertyController.createProperty,
);
route.patch("/:id", auth(Role.LANDLORD), propertyController.updateProperty);
route.delete("/:id", auth(Role.LANDLORD), propertyController.deleteProperty);
route.get(
  "/landlord",
  auth(Role.LANDLORD),
  propertyController.getAllProperties,
);

//
route.get("/", propertyController.getAllProperties);
route.get("/:id", propertyController.getPropertyById);

export const propertyRoute = route;
