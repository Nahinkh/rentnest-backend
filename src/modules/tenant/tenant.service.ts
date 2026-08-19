import { ICreateRental } from "./tenant.interface";
import { prisma } from "../../db";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import {
  PaymentStatus,
  PropertyStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";
import { JwtPayload } from "../auth/auth.interface";

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
  if (
    !Number.isInteger(rentalData.durationMonth) ||
    rentalData.durationMonth <= 0
  ) {
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
      tenant: {
        connect: { id: user.id },
      },
      property: {
        connect: { id: rentalData.propertyId },
      },
      startDate: new Date(rentalData.startDate),
      durationMonth: rentalData.durationMonth,
      message: rentalData.message,
    },
  });

  return rentalRequest;
};

const getRentalRequestsByTenant = async (tenantId: string) => {
  const rentalRequests = await prisma.rentalRequest.findMany({
    where: {
      tenantId: tenantId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      property: {
        include: {
          category: true,
          images: true,
          landlord: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
  return rentalRequests;
};
const getCurrentRental = async (tenantId: string) => {
  const currentRental = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,

      status: RentalRequestStatus.APPROVED,

      payment: {
        status: PaymentStatus.SUCCESS,
      },

      property: {
        isDeleted: false,
        availability: PropertyStatus.RENTED,
      },
    },

    include: {
      payment: true,

      property: {
        include: {
          category: true,

          images: true,

          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return currentRental;
};

const getPropertyRequest = async (landlordId: string) => {
  const request = await prisma.rentalRequest.findMany({
    where: {
      property: {
        landlordId,
        isDeleted: false,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      property: {
        include: {
          category: true,
          images: true,
        },
      },
    },
  });
  return request;
};

const approveRentalRequest = async (requestId: string, user: JwtPayload) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: {
      id: requestId,
    },
    include: {
      property: true,
    },
  });

  if (!rentalRequest) {
    throw new AppError("Rental Request Not Found", httpStatus.NOT_FOUND);
  }
  if (rentalRequest.property.isDeleted) {
    throw new AppError("Property Not Found", httpStatus.NOT_FOUND);
  }
  if (rentalRequest.property.landlordId !== user.id) {
    throw new AppError(
      "You are not authorized to approve this rental request",
      httpStatus.FORBIDDEN,
    );
  }
  if (rentalRequest.status !== RentalRequestStatus.PENDING) {
    throw new AppError(
      "This rental request has already been processed.",
      httpStatus.BAD_REQUEST,
    );
  }

  if (rentalRequest.property.availability !== PropertyStatus.AVAILABLE) {
    throw new AppError(
      "Property is no longer available.",
      httpStatus.BAD_REQUEST,
    );
  }

  // start transaction
  const result = await prisma.$transaction(async (tx) => {
    // Approve Request
    await tx.rentalRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: RentalRequestStatus.APPROVED,
      },
    });

    // Mark Property is Rented
    // await tx.property.update({
    //   where: {
    //     id: rentalRequest.propertyId,
    //   },
    //   data: {
    //     availability: PropertyStatus.RENTED,
    //   },
    // });
    // Reject All Request
    await tx.rentalRequest.updateMany({
      where: {
        propertyId: rentalRequest.propertyId,
        id: {
          not: requestId,
        },
        status: RentalRequestStatus.PENDING,
      },
      data: {
        status: RentalRequestStatus.REJECTED,
      },
    });
    return await tx.rentalRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: {
          include: {
            category: true,
            landlord: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            images: true,
          },
        },
      },
    });
  });
  return result;
};

const rejectRentalRequest = async (requestId: string, user: JwtPayload) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: {
      id: requestId,
    },
    include: {
      property: true,
    },
  });

  if (!rentalRequest) {
    throw new AppError("Rental request not found.", httpStatus.NOT_FOUND);
  }

  if (rentalRequest.property.isDeleted) {
    throw new AppError("Property not found.", httpStatus.NOT_FOUND);
  }

  if (rentalRequest.property.landlordId !== user.id) {
    throw new AppError(
      "You are not authorized to reject this rental request.",
      httpStatus.FORBIDDEN,
    );
  }

  if (rentalRequest.status !== RentalRequestStatus.PENDING) {
    throw new AppError(
      "This rental request has already been processed.",
      httpStatus.BAD_REQUEST,
    );
  }

  const result = await prisma.rentalRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: RentalRequestStatus.REJECTED,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      property: {
        include: {
          category: true,
          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          images: true,
        },
      },
    },
  });
  return result;
};

const cancelRentalRequest = async (requestId: string, user: JwtPayload) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: {
      id: requestId,
    },
    include: {
      property: true,
    },
  });

  if (!rentalRequest) {
    throw new AppError("Rental request not found.", httpStatus.NOT_FOUND);
  }
  if (rentalRequest.tenantId !== user.id) {
    throw new AppError(
      "You are not authorized to cancel this rental request.",
      httpStatus.FORBIDDEN,
    );
  }

  if (rentalRequest.status !== RentalRequestStatus.PENDING) {
    throw new AppError(
      "Only pending rental requests can be cancelled.",
      httpStatus.BAD_REQUEST,
    );
  }
  const result = await prisma.rentalRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: RentalRequestStatus.CANCELLED,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      property: {
        include: {
          category: true,
          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          images: true,
        },
      },
    },
  });

  return result;
};

export const tenantService = {
  createRentalRequest,
  getRentalRequestsByTenant,
  getPropertyRequest,
  getCurrentRental,
  approveRentalRequest,
  rejectRentalRequest,
  cancelRentalRequest,
};
