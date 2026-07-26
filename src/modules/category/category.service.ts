import { Prisma } from "../../../generated/prisma/client";
import { ICategory } from "./category.interface";

const createCategory = async (tx:Prisma.TransactionClient,categoryData: ICategory) => {
    const existingCategory = await tx.category.findUnique({
        where: {
            name: categoryData.name,
        },
    });
    if (existingCategory) {
        return existingCategory;
    }
    const slug = categoryData.name.toLowerCase().replace(/\s+/g, '-');
    const category = await tx.category.create({
        data: {
            name: categoryData.name,
            slug: slug,
            description: categoryData.description || null,
        },
    });
    return category;
}

export const categoryService = {
    createCategory
}