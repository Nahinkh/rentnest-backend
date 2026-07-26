import { prisma } from "../../db";
import { categoryService } from "../category/category.service";
import { IProperty } from "./property.interface";

const createProperty = async (userId: string, propertyData: IProperty) => {
    return await prisma.$transaction(async (tx) => {
        let category = await categoryService.createCategory(tx, propertyData.category);

        if (!category) {
            category = await tx.category.create({
                data: {
                    name: propertyData.category.name,
                    slug: propertyData.category.name.toLowerCase().replace(/\s+/g, '-'),
                    description: propertyData.category.description || null,
                },
            });
        }

        const property = await tx.property.create({
            data: {
                title: propertyData.title,
                description: propertyData.description,
                rentPrice: propertyData.rentPrice,
                bedrooms: propertyData.bedrooms,
                bathrooms: propertyData.bathrooms,
                area: propertyData.area || null,
                address: propertyData.address,
                city: propertyData.city,
                division: propertyData.division,
                latitude: propertyData.latitude || null,
                longitude: propertyData.longitude || null,
                landlord:{
                    connect: {
                        id: userId
                    }
                },
                category: {
                    connect: {
                        id: category.id
                    }
            },
        },
        include:{
            category: true,
            landlord:{
                select:{
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        });
        return property;
})
}



export const propertyService = {
    createProperty
}