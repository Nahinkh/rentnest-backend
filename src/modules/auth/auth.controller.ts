import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import envConfig from "../../config/envConfig";

const createUser = catchAsync(async(req:Request, res:Response) => {
    const payload = req.body;
    const result = await authService.registerUser(payload);
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"User created successfully",
        data:result,
    })

})

const loginUser = catchAsync(async(req:Request, res:Response) => {
    const payload = req.body;
    const {accessToken, refreshToken} = await authService.loginUser(payload);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: envConfig.node_env === "production",
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: envConfig.node_env === "production",
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"User logged in successfully",
        data:{
            accessToken,
            refreshToken
        }
    })
})



export const authController = {
    createUser,
    loginUser
}