import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
const createReview = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user.id;

  const result = await reviewService.createReview(tenantId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review created successfully.",
    data: result,
  });
});

const getPropertyReviews = catchAsync(async (req, res) => {
  const result = await reviewService.getPropertyReview(
    req.params.propertyId as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property reviews retrieved successfully.",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req, res) => {
  const { id: tenantId } = req.user;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await reviewService.getMyReviews(
    tenantId,
    page,
    limit,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My reviews retrieved successfully.",
    data: result,
  });
});
const updateReview = catchAsync(async (req, res) => {
  const { id: tenantId } = req.user;

  const result = await reviewService.updateReview(
    tenantId,
    req.params.reviewId as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated successfully.",
    data: result,
  });
});

export const reviewController = {
  createReview,
  getPropertyReviews,
  getMyReviews,
  updateReview
};
