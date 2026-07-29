import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../db";
import { createCategoryHelper } from "./category.helper";
import { ICategory } from "./category.interface";

const createCategory = async (categoryData: ICategory) => {
  return await prisma.$transaction(async (tx) => {
    return await createCategoryHelper(tx, categoryData);
  });
};

const getAllCategories = async () => {
    return await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
        }
    })
}

const updateCategory = async (categoryId: string, categoryData: ICategory) => {
    return await prisma.category.update({
        where: {
            id: categoryId,
        },
        data: {
            name: categoryData.name,
            slug: categoryData.name.toLowerCase().replace(/\s+/g, "-"),
            description: categoryData.description || null,
        },
    });
}

const deleteCategory = async (categoryId: string) => {
    return await prisma.category.delete({
        where: {
            id: categoryId,
        },
    });
}

export const categoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
