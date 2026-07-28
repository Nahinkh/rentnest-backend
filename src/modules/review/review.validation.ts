import {
  PaymentStatus,
  PropertyStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../db";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";

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
