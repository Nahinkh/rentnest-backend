import { JwtPayload } from "jsonwebtoken";
import { ICreateRental } from "./tenant.interface";
import { prisma } from "../../db";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import {
  PropertyStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";

const createRentalRequest = async (
  user: JwtPayload,
  rentalData: ICreateRental,
) => {
  // Check if the property exists and is not deleted
  const property = await prisma.property.findUnique({
    where: {
      id: rentalData.propertyId,
      isDeleted: false,
    },
  });
  if (!property) {
    throw new AppError(
      "Property not found or has been deleted",
      httpStatus.NOT_FOUND,
    );
  }
  // check if Property is Available
  if (property.availability !== PropertyStatus.AVAILABLE) {
    throw new AppError(
      "Property is not available for rental",
      httpStatus.BAD_REQUEST,
    );
  }

  // check requesting own property
  if (property.landlordId === user.id) {
    throw new AppError(
      "You cannot request your own property",
      httpStatus.BAD_REQUEST,
    );
  }

  // Check if durationMonth is a positive integer
  if (!Number.isInteger(rentalData.durationMonth) || rentalData.durationMonth <= 0) {
    throw new AppError(
      "Duration month must be a positive integer",
      httpStatus.BAD_REQUEST,
    );
  }

  

  // Duplicate Request Check
  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId: user.id,
      propertyId: rentalData.propertyId,
      status: RentalRequestStatus.PENDING,
    },
  });

  if (existingRequest) {
    throw new AppError(
      "You have already requested this property",
      httpStatus.BAD_REQUEST,
    );
  }

  // Create the rental request
  const rentalRequest = await prisma.rentalRequest.create({
    data: {
        tenant:{
            connect: { id: user.id },
        },
        property:{
            connect: { id: rentalData.propertyId },
        },
        startDate: new Date(rentalData.startDate),
        durationMonth: rentalData.durationMonth,
        message: rentalData.message,
    },
    }
  );

  return rentalRequest;
};

export const tenantService = {
  createRentalRequest,
};
