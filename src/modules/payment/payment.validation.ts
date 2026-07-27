import { RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../db";
import AppError from "../../utils/AppError";
import { JwtPayload } from "../auth/auth.interface";
import { ICreatePaymentIntent } from "./payment.interface";
import httpStatus from "http-status";

export const validatePaymentRequest = async (
  payload: ICreatePaymentIntent,
  user: JwtPayload
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
    throw new AppError(
        "Rental request not found.",
        httpStatus.NOT_FOUND,
    );
  }

  if (rentalRequest.tenantId !== user.id) {
    throw new AppError(
        "You are not authorized.",
        httpStatus.FORBIDDEN,
    );
  }

  if (
    rentalRequest.status !== RentalRequestStatus.APPROVED
  ) {
    throw new AppError(
        "Rental request has not been approved.",
        httpStatus.BAD_REQUEST,
    );
  }

  if (rentalRequest.payment) {
    throw new AppError(
        "Payment already exists.",
        httpStatus.BAD_REQUEST,
    );
  }

  const amount = Number(rentalRequest.property.rentPrice);

  return {
    rentalRequest,
    amount,
  };

};

