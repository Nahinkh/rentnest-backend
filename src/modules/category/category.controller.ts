import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { categoryService } from "./category.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const categoryData = req.body;
    const category = await categoryService.createCategory(categoryData);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Category created successfully",
      data: category
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Categories fetched successfully",
      data: categories
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const categoryId = req.params.id;
    const categoryData = req.body;
    const category = await categoryService.updateCategory(categoryId as string, categoryData);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category updated successfully",
      data: category
    });
})

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const categoryId = req.params.id;
    const category = await categoryService.deleteCategory(categoryId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category deleted successfully",
      data: category
    });
});

export const categoryController = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
};