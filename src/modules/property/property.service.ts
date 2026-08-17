import { Prisma, PropertyStatus } from "../../../generated/prisma/client";
import { prisma } from "../../db";
import { PaginationOptions } from "../../interfaces/pagination";
import AppError from "../../utils/AppError";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "../../utils/cloudinary";
import { paginationCalculate } from "../../utils/pagination";
import { JwtPayload } from "../auth/auth.interface";
import { createCategoryHelper } from "../category/category.helper";
import { categoryService } from "../category/category.service";
import { propertySearchableFields } from "./property.constant";
import {
  IProperty,
  IUpdateProperty,
  PropertyFilters,
} from "./property.interface";
import httpStatus from "http-status";

const createProperty = async (
  userId: string,
  propertyData: IProperty,
  files: Express.Multer.File[] = [],
) => {
  const uploadImages: {
    imageUrl: string;
    publicId: string;
  }[] = [];
  try {
    // Upload images to Cloudinary
    for (const file of files) {
      const uploaded = await uploadImageToCloudinary(
        file.buffer,
        "rentnest/properties",
      );
      uploadImages.push(uploaded);
    }

    // Create property with uploaded images
    const property = await prisma.$transaction(
      async (tx) => {
        let category = await createCategoryHelper(tx, propertyData.category as any);
        const createdProperty = await tx.property.create({
          data: {
            title: propertyData.title,
            description: propertyData.description,
            rentPrice: propertyData.rentPrice,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            area: propertyData.area,
            address: propertyData.address,
            city: propertyData.city,
            division: propertyData.division,
            latitude: propertyData.latitude,
            longitude: propertyData.longitude,
            
            category: {
              connect: {
                id: category.id,
              },
            },
            landlord: {
              connect: {
                id: userId,
              }
            },
            images:{
              create: uploadImages.map((image) => ({
                imageUrl: image.imageUrl,
                publicId: image.publicId, 
              })),
          
            }
          },
          include: {
            category: true,
            landlord: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            images: true,
          }
        })
        return createdProperty;
      }
    )
    return property;
  } catch (error) {
    // Cleanup uploaded images in case of an error
    await Promise.allSettled(
      uploadImages.map((image) => {
        return deleteImageFromCloudinary(image.publicId);
      }
    )
    )
    throw error;
  }
};

const getAllProperties = async (
  filters: PropertyFilters,
  pagination: PaginationOptions,
  isAdmin?: boolean,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationCalculate(pagination);
  const { searchTerm, minPrice, maxPrice, ...filterData } = filters;
  // Don't show deleted properties
  const andConditions: Prisma.PropertyWhereInput[] = [
    {
      isDeleted: false,
    },
  ];

  // Search term filter
  if (searchTerm) {
    andConditions.push({
      OR: propertySearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Exact match filters
  if (Object.keys(filterData).length) {
    Object.entries(filterData).forEach(([field, value]) => {
      if (!value) return;
      if (field === "category") {
        andConditions.push({
          category: {
            name: String(value),
          },
        });
      } else {
        andConditions.push({
          [field]: value,
        });
      }
    });
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      rentPrice: {
        ...(minPrice && { gte: Number(minPrice) }),
        ...(maxPrice && { lte: Number(maxPrice) }),
      },
    });
  }
  const whereCondition: Prisma.PropertyWhereInput = andConditions.length
    ? { AND: andConditions }
    : {};

  if (!isAdmin) {
    whereCondition.availability = PropertyStatus.AVAILABLE;
  }

  const properties = await prisma.property.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: sortBy
      ? {
          [sortBy]: sortOrder || "asc",
        }
      : {
          createdAt: "desc",
        },
    include: {
      category: true,
      landlord: {
        select: {
          name: true,
          email: true,
        },
      },
      images: true,
    },
  });

  // Count total properties for pagination
  const total = await prisma.property.count({
    where: whereCondition,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: properties,
  };
};

const getPropertyById = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
      isDeleted: false,
    },
    include: {
      category: true,
      landlord: {
        select: {
          name: true,
          email: true,
        },
      },
      images: true,
      reviews: {
        include: {
          tenant: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
  if (!property) {
    throw new AppError("Property not found", httpStatus.NOT_FOUND);
  }
  return property;
};

const updateProperty = async (
  propertyId: string,
  propertyData: IUpdateProperty,
  user: JwtPayload,
) => {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
      isDeleted: false,
    },
  });
  if (!property) {
    throw new AppError("Property not found", httpStatus.NOT_FOUND);
  }
  if (user.role !== "ADMIN" && property.landlordId !== user.id) {
    throw new AppError(
      "You are not authorized to update this property",
      httpStatus.FORBIDDEN,
    );
  }
  const updatedProperty = await prisma.$transaction(async (tx) => {
    const { category, ...dataWithoutCategory } = propertyData;
    const updateData: Prisma.PropertyUpdateInput = {
      ...dataWithoutCategory,
    };
    if (category) {
      const categoryResult = await categoryService.createCategory(category);
      updateData.category = {
        connect: {
          id: categoryResult.id,
        },
      };
    }
    const updatedProperty = await tx.property.update({
      where: {
        id: propertyId,
      },
      data: updateData,
      include: {
        category: true,
        landlord: {
          select: {
            name: true,
            email: true,
          },
        },
        images: true,
      },
    });

    return updatedProperty;
  });
  return updatedProperty;
};

const deleteProperty = async (propertyId: string, user: JwtPayload) => {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
      isDeleted: false,
    },
  });

  if (!property) {
    throw new AppError("Property not found", httpStatus.NOT_FOUND);
  }

  if (user.role !== "ADMIN" && property.landlordId !== user.id) {
    throw new AppError(
      "You are not authorized to delete this property",
      httpStatus.FORBIDDEN,
    );
  }

  const deletedProperty = await prisma.property.update({
    where: {
      id: propertyId,
    },
    data: {
      isDeleted: true,
    },
  });
};

export const propertyService = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
