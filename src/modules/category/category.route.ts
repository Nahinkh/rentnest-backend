import { Router } from "express";
import { categoryController } from "./category.controller";

const route =Router();

//Admin routes
route.post("/admin",categoryController.createCategory);
route.get("/admin",categoryController.getAllCategories);
route.patch("/admin/:id",categoryController.updateCategory);
route.delete("/admin/:id",categoryController.deleteCategory);

export const categoryRoute = route;