import { prisma } from "../../db";
import AppError from "../../utils/AppError";
import { IProperty } from "./property.interface";
import httpStatus from "http-status";

const createProperty = async (userId: string, propertyData: IProperty) => {
    const isUserExist = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        }
    })
    if (!isUserExist || isUserExist.role !== "LANDLORD") {
        throw new AppError("User not found or not a landlord",httpStatus.NOT_FOUND);
    }

}

export const propertyService = {
    createProperty
}