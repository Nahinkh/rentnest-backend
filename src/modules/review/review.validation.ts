import {
  PaymentStatus,
  PropertyStatus,
  RentalRequestStatus,
  ReviewStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../db";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { ICreateReview } from "./review.interface";

export const validateCreateReview = async (
  tenantId: string,
  rentalRequestId: string,
  rating: number,
) => {
  if (rating < 1 || rating > 5) {
    throw new AppError(
      "Rating must be between 1 and 5.",
      httpStatus.BAD_REQUEST,
    );
  }

  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: {
      id: rentalRequestId,
    },
    include: {
      payment: true,
      property: true,
      review: true,
    },
  });

  if (!rentalRequest) {
    throw new AppError("Rental request not found.", httpStatus.NOT_FOUND);
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(
      "You are not allowed to review this rental.",
      httpStatus.FORBIDDEN,
    );
  }

  if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
    throw new AppError(
      "Rental request is not approved.",
      httpStatus.BAD_REQUEST,
    );
  }

  if (
    !rentalRequest.payment ||
    rentalRequest.payment.status !== PaymentStatus.SUCCESS
  ) {
    throw new AppError(
      "Complete payment before reviewing.",
      httpStatus.BAD_REQUEST,
    );
  }

  if (rentalRequest.property.availability !== PropertyStatus.RENTED) {
    throw new AppError("Property is not rented.", httpStatus.BAD_REQUEST);
  }

  if (rentalRequest.review) {
    throw new AppError("Review already exists.", httpStatus.BAD_REQUEST);
  }

  return rentalRequest;
};
export const validateUpdateReview = async (
  tenantId: string,
  reviewId: string,
  payload: Partial<ICreateReview>,
) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new AppError("Review not found.", httpStatus.NOT_FOUND);
  }

  if (review.tenantId !== tenantId) {
    throw new AppError(
      "You are not allowed to update this review.",
      httpStatus.FORBIDDEN,
    );
  }

  if (
    payload.rating !== undefined &&
    (payload.rating < 1 || payload.rating > 5)
  ) {
    throw new AppError(
      "Rating must be between 1 and 5.",
      httpStatus.BAD_REQUEST,
    );
  }

  return review;
};

export const validateDeleteReview = async (
  tenantId: string,
  reviewId: string,
) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new AppError("Review not found.",httpStatus.NOT_FOUND,);
  }

  if (review.tenantId !== tenantId) {
    throw new AppError(
      "You are not allowed to access this review.",
      httpStatus.FORBIDDEN,
    );
  }

  return review;
};

export const validateUpdateReviewStatus = async (reviewId: string, status: ReviewStatus) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new AppError("Review not found", httpStatus.NOT_FOUND);
  }
  if(!Object.values(ReviewStatus).includes(status)) {
    throw new AppError("Invalid review status", httpStatus.BAD_REQUEST);
  }

  if (review.status === status) {
    throw new AppError(
      `Review status is already ${status}`,
      httpStatus.BAD_REQUEST,
    );
  }


  return review;
}
