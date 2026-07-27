import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import { ICreateRental } from "./tenant.interface";
import { Request, Response } from "express";
import { tenantService } from "./tenant.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createRentalRequest = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const rentalData = req.body as ICreateRental;

  const rentalRequest = await tenantService.createRentalRequest(user, rentalData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental request created successfully",
    data: rentalRequest
  });
});

export const tenantController = {
  createRentalRequest,
};