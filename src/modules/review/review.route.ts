import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import auth from "../../middleware/auth";
import { paymentController } from "../payment/payment.controller";
import { reviewController } from "./review.controller";

const route = Router();

route.post("/",auth(Role.TENANT),reviewController.createReview)

export const reviewRoute =route