import bcrypt from "bcryptjs";
import { prisma } from "../../db";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import envConfig from "../../config/envConfig";
import { SignOptions } from "jsonwebtoken";
import { createAccessToken, verifyToken } from "../../utils/jwt";
import {
  CreateUserPayload,
  JwtPayload,
  LoginUserPayload,
} from "./auth.interface";
import { isProfileComplete } from "../../utils/profile";

// Helper function to get user by email form the database
const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email: email,
    },
  });
};
const registerUser = async (payload: CreateUserPayload) => {
  const existingUser = await getUserByEmail(payload.email);
  if (existingUser) {
    throw new AppError("User already exists", httpStatus.CONFLICT);
  }
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(envConfig.bcrypt_salt_rounds),
  );
  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      avatarUrl: payload.avatarUrl,
    },
    omit: {
      password: true,
    },
  });
  return newUser;
};

const loginUser = async (payload: LoginUserPayload) => {
  const user = await getUserByEmail(payload.email);

  if (!user) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }

  if (user.status === "BLOCKED") {
    throw new AppError("User is blocked", httpStatus.FORBIDDEN);
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatch) {
    throw new AppError("Invalid email or password", httpStatus.UNAUTHORIZED);
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = createAccessToken(
    jwtPayload,
    envConfig.jwt_access_secret as string,
    envConfig.jwt_access_expires_in as SignOptions["expiresIn"],
  );
  const refreshToken = createAccessToken(
    jwtPayload,
    envConfig.jwt_refresh_secret as string,
    envConfig.jwt_refresh_expires_in as SignOptions["expiresIn"],
  );

  return { user, accessToken, refreshToken };
};

const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });
  if (!user) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }
  return user;
};
const updateProfile = async (
  userId: string,
  payload: {
    name?: string;
    phone?: string;
    avatarUrl?: string;
    division?: string;
    district?: string;
    city?: string;
    address?: string;
  },
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: payload.name,
      phone: payload.phone,
      avatarUrl: payload.avatarUrl,
      division: payload.division,
      district: payload.district,
      city: payload.city,
      address: payload.address,
    },
    omit: {
      password: true,
    },
  });

  return updatedUser;
};
const applyAsLandlord = async (
  userId: string,
  payload: {
    reason?: string;
    additionalInfo?: string;
  },
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      landlordApplication: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }

  if (user.role === "LANDLORD") {
    throw new AppError("You are already a landlord", httpStatus.BAD_REQUEST);
  }

  if (!isProfileComplete(user)) {
    throw new AppError(
      "Please complete your profile before applying to become a landlord",
      httpStatus.BAD_REQUEST,
    );
  }

  if (user.landlordApplication?.status === "PENDING") {
    throw new AppError(
      "Your landlord application is already under review",
      httpStatus.CONFLICT,
    );
  }

  const application = user.landlordApplication
    ? await prisma.landlordApplication.update({
        where: {
          userId,
        },
        data: {
          reason: payload.reason,
          additionalInfo: payload.additionalInfo,
          status: "PENDING",
          rejectionReason: null,
          reviewedById: null,
          reviewedAt: null,
        },
      })
    : await prisma.landlordApplication.create({
        data: {
          userId,
          reason: payload.reason,
          additionalInfo: payload.additionalInfo,
        },
      });

  return application;
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError("Refresh token is required", httpStatus.BAD_REQUEST);
  }
  const decoded = verifyToken(token, envConfig.jwt_refresh_secret as string);
  const user = await getUserByEmail(decoded.email);
  if (!user) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }

  if (user.status === "BLOCKED") {
    throw new AppError("User is blocked", httpStatus.FORBIDDEN);
  }
  const jwtPayload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = createAccessToken(
    jwtPayload,
    envConfig.jwt_access_secret as string,
    envConfig.jwt_access_expires_in as SignOptions["expiresIn"],
  );

  return { accessToken };
};

export const authService = {
  registerUser,
  loginUser,
  refreshToken,
  getProfile,
  updateProfile,
  applyAsLandlord,
};
