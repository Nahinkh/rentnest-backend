import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { propertyService } from "./property.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createProperty = catchAsync(async (req:Request, res:Response) => {
    const userId = req.user?.id;
    const propertyData = req.body;
    const property = await propertyService.createProperty(userId, propertyData);
    sendResponse(res,{
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Property created successfully",
        data: property
    });
})

export const propertyController = {
    createProperty
}