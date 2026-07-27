import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { propertyService } from "./property.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { queryBuilder } from "../../utils/queryBuilder";
import { propertyFilterableFields, propertySearchableFields } from "./property.constant";
import { paginationFields } from "../../constants/pagination";

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

const getAllProperties = catchAsync(async (req:Request, res:Response) => {
    const filters = queryBuilder(req.query,propertyFilterableFields)
    const paginationOptions = queryBuilder(req.query,paginationFields)
    const result = await propertyService.getAllProperties(filters, paginationOptions);
    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties retrieved successfully",
        data: result.data
    });
})

const getPropertyById = catchAsync(async (req:Request, res:Response) => {
    const propertyId = req.params.id;
    const property = await propertyService.getPropertyById(propertyId as string);
    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: "Property retrieved successfully",
        data: property
    });
})

const updateProperty = catchAsync(async (req:Request, res:Response) => {
    const result = await propertyService.updateProperty(req.params.id as string, req.body, req.user)
    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: "Property updated successfully",
        data: result
    });
})

const deleteProperty = catchAsync(async (req:Request, res:Response) => {
    const propertyId = req.params.id;
    await propertyService.deleteProperty(propertyId as string, req.user);
    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: "Property deleted successfully",
        data: null
    });

})

export const propertyController = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
}
