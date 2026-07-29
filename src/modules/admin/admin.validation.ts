import { Status } from "../../../generated/prisma/enums";
import { prisma } from "../../db";

export  const validateUpdateUserStatus = async(adminId:string,userId:string,status:Status)=>{
    const user = await prisma.user.findUnique({
        where:{
            id:userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role === "ADMIN") {
        throw new Error("Cannot update status of an admin user");
    }
    if (user.status === status) {
        throw new Error(`User status is already ${status}`);
    }
    if (user.id === adminId) {
        throw new Error("Admin cannot update their own status");
    }
    if(!Object.values(Status).includes(status)){
        throw new Error("Invalid status value");
    }
    return user;
}