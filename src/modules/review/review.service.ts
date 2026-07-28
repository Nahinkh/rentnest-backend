import { ReviewStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../db";
import { ICreateReview } from "./review.interface";
import { validateCreateReview, validateUpdateReview } from "./review.validation";

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
            rentPrice:true,
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
  await validateUpdateReview(
    tenantId,
    reviewId,
    payload,
  );

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

export const reviewService = {
  createReview,
  getPropertyReview,
  getMyReviews,
  updateReview
};
