import { PaymentStatus, PropertyStatus, RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../db";
import AppError from "../../utils/AppError";
import { JwtPayload } from "../auth/auth.interface";
import { ICreatePaymentIntent } from "./payment.interface";
import httpStatus from "http-status";

export const validatePaymentRequest = async (
  payload: ICreatePaymentIntent,
  user: JwtPayload,
) => {
  if (!payload.rentalRequestId) {
    throw new AppError(
      "Rental request id is required.",
      httpStatus.BAD_REQUEST,
    );
  }

  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: {
      id: payload.rentalRequestId,
    },
    include: {
      property: true,
      payment: true,
    },
  });

  if (!rentalRequest) {
    throw new AppError("Rental request not found",httpStatus.NOT_FOUND,);
  }

  if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
    throw new AppError(
      "Rental request is not approved",
      httpStatus.BAD_REQUEST,
    );
  }

  if (rentalRequest.property.availability === PropertyStatus.RENTED) {
    throw new AppError(
      "Property has already been rented",
      httpStatus.BAD_REQUEST,
    );
  }
  if (rentalRequest.property.availability === PropertyStatus.UNAVAILABLE) {
    throw new AppError(
      "Property has already been UNAVAILABLE",
      httpStatus.BAD_REQUEST,
    );
  }

  if (
    rentalRequest.payment &&
    rentalRequest.payment.status === PaymentStatus.SUCCESS
  ) {
    throw new AppError(
      "Payment has already been completed",
      httpStatus.BAD_REQUEST,
    );
  }

  const amount = Number(rentalRequest.property.rentPrice);

  return {
    rentalRequest,
    amount,
  };
};
