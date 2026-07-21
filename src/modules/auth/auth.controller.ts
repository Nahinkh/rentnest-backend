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

const getProfile = catchAsync(async(req:Request, res:Response) => {
    const user = await authService.getProfile(req.user?.id as string);
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"User profile fetched successfully",
        data:user,
    })
})
const logout = catchAsync(async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: envConfig.node_env === "production",
    sameSite:
      envConfig.node_env === "production"
        ? "none"
        : "lax",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logged out successfully",
    data: null,
  });
});

const refreshToken = catchAsync(async(req:Request, res:Response) => {
    const refreshToken = req.cookies.refreshToken;
    const {accessToken} = await authService.refreshToken(refreshToken);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: envConfig.node_env === "production",
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    });  
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"Access token refreshed successfully",
    })
})



export const authController = {
    createUser,
    loginUser,
    getProfile,
    refreshToken,
    logout
}