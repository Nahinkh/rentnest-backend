import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { queryBuilder } from "../../utils/queryBuilder";
import { adminUserFilterableFields } from "./admin.constant";
import { adminService } from "./admin.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { propertyService } from "../property/property.service";

const getAllUsersByAdmin = catchAsync(async(req: Request, res: Response) => {
    const filters = queryBuilder(req.query,adminUserFilterableFields);
    const paginationOptions = queryBuilder(req.query,["page","limit","sortBy","sortOrder"]);
    const result = await adminService.getAllUsers(filters,paginationOptions);
    sendResponse(res,{
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result.data,
    })
});
const updateUserStatusByAdmin = catchAsync(async(req: Request, res: Response) => {
    const { userId} = req.params ;
    const { status } = req.body;
    const adminId = req.user?.id as string;
    const result = await adminService.updateUserStatus(adminId, userId as string, status);
    sendResponse(res,{
        statusCode: httpStatus.OK,
        success: true,
        message: "User status updated successfully",
        data: result,
    })
})

const getAllPropertiesByAdmin = catchAsync(async(req: Request, res: Response) => {
    const filters = queryBuilder(req.query,adminUserFilterableFields);
    const paginationOptions = queryBuilder(req.query,["page","limit","sortBy","sortOrder"]);
    const result = await propertyService.getAllProperties(filters,paginationOptions,true);
    sendResponse(res,{
        statusCode: httpStatus.OK,
        success: true,
        message: "Properties retrieved successfully",
        data: result.data,
    })
})

const getAllRentalRequestsByAdmin = catchAsync(async(req: Request, res: Response) => {
    const filters = queryBuilder(req.query,["searchTerm","status","availability","location"]);
    const paginationOptions = queryBuilder(req.query,["page","limit","sortBy","sortOrder"]);
    const result = await adminService.getAllRentalRequests(filters,paginationOptions);
    sendResponse(res,{
        statusCode: httpStatus.OK,
        success: true,
        message: "Rental requests retrieved successfully",
        data: result.data,
    })
})

export const adminController = {
    getAllUsersByAdmin,
    updateUserStatusByAdmin,
    getAllPropertiesByAdmin,
    getAllRentalRequestsByAdmin,
}