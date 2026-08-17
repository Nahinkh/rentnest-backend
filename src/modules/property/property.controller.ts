import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { propertyService } from "./property.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { queryBuilder } from "../../utils/queryBuilder";
import {
  propertyFilterableFields,
  propertySearchableFields,
} from "./property.constant";
import { paginationFields } from "../../constants/pagination";

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  console.log(userId)
  const files = (req.files as Express.Multer.File[] | null) || [];
 
  const propertyData = {
    ...req.body,
    rentPrice: Number(req.body.rentPrice),
    bedrooms: Number(req.body.bedrooms),
    bathrooms: Number(req.body.bathrooms),
    area: req.body.area ? Number(req.body.area) : undefined,

    latitude: req.body.latitude ? Number(req.body.latitude) : undefined,

    longitude: req.body.longitude ? Number(req.body.longitude) : undefined,
    category: {
      name: req.body.category,
      description: req.body.description || "",
    },
  };

  const property = await propertyService.createProperty(userId, propertyData, files);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Property created successfully",
    data: property,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const filters = queryBuilder(req.query, propertyFilterableFields);
  const paginationOptions = queryBuilder(req.query, paginationFields);
  const isAdmin = req.user?.role === "ADMIN";
  const result = await propertyService.getAllProperties(
    filters,
    paginationOptions,
    isAdmin,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Properties retrieved successfully",
    data: result.data,
  });
});

const getPropertyById = catchAsync(async (req: Request, res: Response) => {
  const propertyId = req.params.id;
  const property = await propertyService.getPropertyById(propertyId as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property retrieved successfully",
    data: property,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.updateProperty(
    req.params.id as string,
    req.body,
    req.user,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property updated successfully",
    data: result,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const propertyId = req.params.id;
  await propertyService.deleteProperty(propertyId as string, req.user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property deleted successfully",
    data: null,
  });
});

export const propertyController = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
