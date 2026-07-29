import { Prisma, Status } from "../../../generated/prisma/browser";
import { prisma } from "../../db";
import { PaginationOptions } from "../../interfaces/pagination";
import { paginationCalculate } from "../../utils/pagination";
import { IAdminRentalFilters, IAdminUserFilters } from "./admin.interface";
import { validateUpdateUserStatus } from "./admin.validation";

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
      select:{
        id:true,
        name:true,
        email:true,
        phone:true,
        role:true,
        status:true,
        createdAt:true,
        updatedAt:true,
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

const updateUserStatus = async (adminId: string, userId: string, status: Status) => {
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

const getAllRentalRequests = async (filters: IAdminRentalFilters, options: PaginationOptions) => {
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

export const adminService = {
  getAllUsers,
    updateUserStatus,
    getAllRentalRequests,
};
