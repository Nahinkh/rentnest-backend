import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { paginationFields } from "../../constants/pagination";
import { queryBuilder } from "../../utils/queryBuilder";
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

  const result = await reviewService.getMyReviews(tenantId, page, limit);

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

const deleteReview = catchAsync(async (req, res) => {
  const { id: tenantId } = req.user;

  await reviewService.deleteReview(tenantId, req.params.reviewId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully.",
    data: null,
  });
});

// Get Landlord property Reviews
const getLandlordPropertyPreviews = catchAsync(
  async (req: Request, res: Response) => {
    const { id: landlordId } = req.user;
    const result = await reviewService.getLandlordPropertyReviews(
      landlordId,
      req.query,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property reviews retrieved successfully.",
      data: result,
    });
  },
);

const getAllReviewsByAdmin = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = queryBuilder(req.query, paginationFields);
  const filter = queryBuilder(req.query, ["status"]);
  const result = await reviewService.getAllReviewsByAdmin(
    paginationOptions,
    filter,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All reviews retrieved successfully.",
    data: result,
  });
});

const changeReviewStatusByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { reviewId } = req.params;
    const { status } = req.body;

    const result = await reviewService.changeReviewStatusByAdmin(
      reviewId as string,
      status,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Review status updated successfully.",
      data: result,
    });
  },
);

export const reviewController = {
  createReview,
  getPropertyReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getLandlordPropertyPreviews,
  getAllReviewsByAdmin,
  changeReviewStatusByAdmin,
};
