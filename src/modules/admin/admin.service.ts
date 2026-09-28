import { Prisma, Status } from "../../../generated/prisma/browser";
import { prisma } from "../../db";
import { PaginationOptions } from "../../interfaces/pagination";
import AppError from "../../utils/AppError";
import { paginationCalculate } from "../../utils/pagination";
import { IAdminRentalFilters, IAdminUserFilters } from "./admin.interface";
import { validateUpdateUserStatus } from "./admin.validation";
import httpStatus from "http-status";

const getAllUsers = async (
  filters: IAdminUserFilters,
  options: PaginationOptions,
) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationCalculate(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions: Prisma.UserWhereInput[] = [];

  // Search
  if (searchTerm) {
    andConditions.push({
      OR: [{ name: { contains: searchTerm, mode: "insensitive" } }],
    });
  }
  // Filter
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }
  const whereCondition: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const [total, users] = await prisma.$transaction([
    prisma.user.count({
      where: whereCondition,
    }),
    prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
    }),
    prisma.user.count({
      where: whereCondition,
    }),
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: users,
  };
};

const updateUserStatus = async (
  adminId: string,
  userId: string,
  status: Status,
) => {
  const user = await validateUpdateUserStatus(adminId, userId, status);
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
  });
};

const getAllRentalRequests = async (
  filters: IAdminRentalFilters,
  options: PaginationOptions,
) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationCalculate(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions: Prisma.RentalRequestWhereInput[] = [];

  // Search
  if (searchTerm) {
    andConditions.push({
      OR: [{ message: { contains: searchTerm, mode: "insensitive" } }],
    });
  }
  // Filter
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }
  const whereCondition: Prisma.RentalRequestWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const [total, rentalRequests] = await prisma.$transaction([
    prisma.rentalRequest.count({
      where: whereCondition,
    }),
    prisma.rentalRequest.findMany({
      where: whereCondition,
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
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
    }),
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: rentalRequests,
  };
};
const getLandlordApplications = async () => {
  const applications = await prisma.landlordApplication.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          division: true,
          district: true,
          city: true,
          address: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return applications;
};
const reviewLandlordApplication = async (
  adminId: string,
  applicationId: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string,
) => {
  const application = await prisma.landlordApplication.findUnique({
    where: {
      id: applicationId,
    },
  });

  if (!application) {
    throw new AppError("Landlord application not found", httpStatus.NOT_FOUND);
  }

  if (application.status !== "PENDING") {
    throw new AppError(
      "This application has already been reviewed",
      httpStatus.CONFLICT,
    );
  }

  if (status === "REJECTED" && !rejectionReason?.trim()) {
    throw new AppError("Rejection reason is required", httpStatus.BAD_REQUEST);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedApplication = await tx.landlordApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status,
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
      },
    });

    if (status === "APPROVED") {
      await tx.user.update({
        where: {
          id: application.userId,
        },
        data: {
          role: "LANDLORD",
        },
      });
    }

    return updatedApplication;
  });

  return result;
};
const getDashboardStats = async () => {
  const [totalUsers, totalProperties, totalRentalRequests, totalPayments] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.property.count(),
      prisma.rentalRequest.count(),
      prisma.payment.count(),
    ]);

  return {
    totalUsers,
    totalProperties,
    totalRentalRequests,
    totalPayments,
  };
};
const getLandlordApplicationHistory = async () => {
  const applications = await prisma.landlordApplication.findMany({
    where: {
      status: {
        in: ["APPROVED", "REJECTED"],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          division: true,
          district: true,
          city: true,
          address: true,
        },
      },
    },
    orderBy: {
      reviewedAt: "desc",
    },
  });

  return applications;
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllRentalRequests,
  getDashboardStats,
  getLandlordApplications,
  reviewLandlordApplication,
  getLandlordApplicationHistory
};
