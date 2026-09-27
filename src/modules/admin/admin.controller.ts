import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { queryBuilder } from "../../utils/queryBuilder";
import { adminUserFilterableFields } from "./admin.constant";
import { adminService } from "./admin.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { propertyService } from "../property/property.service";
import AppError from "../../utils/AppError";

const getAllUsersByAdmin = catchAsync(async (req: Request, res: Response) => {
  const filters = queryBuilder(req.query, adminUserFilterableFields);
  const paginationOptions = queryBuilder(req.query, [
    "page",
    "limit",
    "sortBy",
    "sortOrder",
  ]);
  const result = await adminService.getAllUsers(filters, paginationOptions);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});
const updateUserStatusByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { status } = req.body;
    const adminId = req.user?.id as string;
    const result = await adminService.updateUserStatus(
      adminId,
      userId as string,
      status,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User status updated successfully",
      data: result,
    });
  },
);

const getAllPropertiesByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const filters = queryBuilder(req.query, adminUserFilterableFields);
    const paginationOptions = queryBuilder(req.query, [
      "page",
      "limit",
      "sortBy",
      "sortOrder",
    ]);
    const result = await propertyService.getAllProperties(
      filters,
      paginationOptions,
      true,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Properties retrieved successfully",
      data: result.data,
    });
  },
);

const getAllRentalRequestsByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const filters = queryBuilder(req.query, [
      "searchTerm",
      "status",
      "availability",
      "location",
    ]);
    const paginationOptions = queryBuilder(req.query, [
      "page",
      "limit",
      "sortBy",
      "sortOrder",
    ]);
    const result = await adminService.getAllRentalRequests(
      filters,
      paginationOptions,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Rental requests retrieved successfully",
      data: result.data,
    });
  },
);

const getLandlordApplications = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getLandlordApplications();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Landlord applications retrieved successfully",
      data: result,
    });
  },
);
const reviewLandlordApplication = catchAsync(
  async (req: Request, res: Response) => {
    const { applicationId } = req.params;
    const { status, rejectionReason } = req.body;

    if (status !== "APPROVED" && status !== "REJECTED") {
      throw new AppError("Invalid application status", httpStatus.BAD_REQUEST);
    }

    const result = await adminService.reviewLandlordApplication(
      req.user.id,
      applicationId as string,
      status,
      rejectionReason,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        status === "APPROVED"
          ? "Landlord application approved successfully"
          : "Landlord application rejected successfully",
      data: result,
    });
  },
);

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getDashboardStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard statistics retrieved successfully",
    data: result,
  });
});

export const adminController = {
  getAllUsersByAdmin,
  updateUserStatusByAdmin,
  getAllPropertiesByAdmin,
  getAllRentalRequestsByAdmin,
  getDashboardStats,
  getLandlordApplications,
  reviewLandlordApplication,
};
