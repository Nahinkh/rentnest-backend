import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import envConfig from "../../config/envConfig";
import AppError from "../../utils/AppError";

const isProduction = envConfig.node_env === "production";
const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authService.registerUser(payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User created successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const isProduction = envConfig.node_env === "production";
  const { accessToken, refreshToken } = await authService.loginUser(payload);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: envConfig.node_env === "production",
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: envConfig.node_env === "production",
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: {
      accessToken,
      refreshToken,
    },
  });
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user?.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile fetched successfully",
    data: user,
  });
});
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { name, phone, avatarUrl, division, district, city, address } =
    req.body;

  if (
    name === undefined &&
    phone === undefined &&
    avatarUrl === undefined &&
    division === undefined &&
    district === undefined &&
    city === undefined &&
    address === undefined
  ) {
    throw new AppError(
      "At least one profile field is required",
      httpStatus.BAD_REQUEST,
    );
  }

  const result = await authService.updateProfile(req.user.id, {
    name,
    phone,
    avatarUrl,
    division,
    district,
    city,
    address,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});
const applyAsLandlord = catchAsync(async (req: Request, res: Response) => {
  const { reason, additionalInfo } = req.body;

  const result = await authService.applyAsLandlord(req.user.id, {
    reason,
    additionalInfo,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Landlord application submitted successfully",
    data: result,
  });
});
const logout = catchAsync(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: envConfig.node_env === "production",
    sameSite: envConfig.node_env === "production" ? "none" : "lax",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logged out successfully",
    data: null,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const { accessToken } = await authService.refreshToken(refreshToken);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: envConfig.node_env === "production",
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Access token refreshed successfully",
  });
});

export const authController = {
  createUser,
  loginUser,
  getProfile,
  refreshToken,
  logout,
  updateProfile,
  applyAsLandlord,
};
