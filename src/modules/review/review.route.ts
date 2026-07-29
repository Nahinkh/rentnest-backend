import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import auth from "../../middleware/auth";
import { paymentController } from "../payment/payment.controller";
import { reviewController } from "./review.controller";

const route = Router();

// PUBLIC
route.get("/",reviewController.getPropertyReviews)

// TENANT
route.post("/",auth(Role.TENANT),reviewController.createReview)
route.get("/my-reviews",auth(Role.TENANT),reviewController.getMyReviews)
route.patch("/:reviewId",auth(Role.TENANT),reviewController.updateReview)
route.delete("/:reviewId",auth(Role.TENANT),reviewController.deleteReview)

// LandLord
route.get("/landlord",auth(Role.LANDLORD),reviewController.getLandlordPropertyPreviews);


export const reviewRoute =route