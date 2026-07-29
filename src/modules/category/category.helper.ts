import { Prisma } from "../../../generated/prisma/client";
import { ICategory } from "./category.interface";

export const createCategoryHelper = async (
  tx: Prisma.TransactionClient,
  categoryData: ICategory,
) => {
  const existingCategory = await tx.category.findUnique({
    where: {
      name: categoryData.name,
    },
  });
  if (existingCategory) {
    return existingCategory;
  }
  const slug = categoryData.name.toLowerCase().replace(/\s+/g, "-");
  const category = await tx.category.create({
    data: {
      name: categoryData.name,
      slug: slug,
      description: categoryData.description || null,
    },
  });
    return category;
};
