import { Prisma } from "../../../generated/prisma/browser";
import { ReviewStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../db";
import { PaginationOptions } from "../../interfaces/pagination";
import { paginationCalculate } from "../../utils/pagination";
import { ICreateReview } from "./review.interface";
import {
  validateCreateReview,
  validateDeleteReview,
  validateUpdateReview,
} from "./review.validation";

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

const getPropertyReview = async (propertyId: string) => {
  const review = await prisma.review.findMany({
    where: {
      propertyId,
      status: ReviewStatus.VISIBLE,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const aggregate = await prisma.review.aggregate({
    where: {
      propertyId,
      status: ReviewStatus.VISIBLE,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });
  return {
    averageRating: aggregate._avg.rating ?? 0,
    totalReviews: aggregate._count.id,
    review,
  };
};

const getMyReviews = async (
  tenantId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: {
        tenantId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            rentPrice: true,
            images: true,
            availability: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.review.count({
      where: {
        tenantId,
      },
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: reviews,
  };
};

const updateReview = async (
  tenantId: string,
  reviewId: string,
  payload: Partial<ICreateReview>,
) => {
  await validateUpdateReview(tenantId, reviewId, payload);

  return prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      rating: payload.rating,
      comment: payload.comment,
    },
  });
};

const deleteReview = async (tenantId: string, reviewId: string) => {
  await validateDeleteReview(tenantId, reviewId);

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  return null;
};

const getLandlordPropertyReviews = async (
  landlordId: string,
  options: PaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationCalculate(options);

  // Find all reviews where the property belongs to a specific landlord
  const whereCondition: Prisma.ReviewWhereInput = {
    property: {
      landlordId,
    },
  };

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: whereCondition,
      include: {
        tenant: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({
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
    data: reviews,
  };
};

const getAllReviewsByAdmin = async (
  options: PaginationOptions,
  filter: { status?: ReviewStatus },
) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationCalculate(options);
  const whereCondition: Prisma.ReviewWhereInput = {};
  if (filter.status) {
    whereCondition.status = filter.status;
  }

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: whereCondition,
      include: {
        tenant: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({
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
    data: reviews,
  };
};

export const reviewService = {
  createReview,
  getPropertyReview,
  getMyReviews,
  updateReview,
  deleteReview,
  getLandlordPropertyReviews,
  getAllReviewsByAdmin,
};
