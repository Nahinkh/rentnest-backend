import { prisma } from "../../db";
import { ICreateReview } from "./review.interface";
import { validateCreateReview } from "./review.validation";

const createReview = async (tenantId: string, payload: ICreateReview) => {
  const rentalRequest = await validateCreateReview(
    tenantId,
    payload.rentalRequestId,
    payload.rating,
  );

  const review = await prisma.review.create({
    data: {
      tenantId,
      propertyId: rentalRequest.propertyId,
      rentalRequestId: rentalRequest.id,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  return review;
};

export const reviewService ={
    createReview
}
