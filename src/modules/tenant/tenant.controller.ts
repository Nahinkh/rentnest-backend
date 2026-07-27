
import catchAsync from "../../utils/catchAsync";
import { ICreateRental } from "./tenant.interface";
import { Request, Response } from "express";
import { tenantService } from "./tenant.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { JwtPayload } from "../auth/auth.interface";

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

const getRentalRequestsByTenant = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const rentalRequests = await tenantService.getRentalRequestsByTenant(user.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests retrieved successfully",
        data: rentalRequests
    });
})

const getPropertyRequest = catchAsync(async(req:Request,res:Response)=>{
    const request = await tenantService.getPropertyRequest(req.user.id)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests retrieved successfully",
        data: request
    });
})

const approveRentalRequest = catchAsync(async(req:Request,res:Response)=>{
    const user = req.user as JwtPayload
    const result = await tenantService.approveRentalRequest(req.params.id as string,user)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request approved successfully.",
        data: result
    });

})


export const tenantController = {
  createRentalRequest,
  getRentalRequestsByTenant,
  getPropertyRequest,
  approveRentalRequest
};