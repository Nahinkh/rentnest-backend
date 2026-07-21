import bcrypt from "bcryptjs";
import { prisma } from "../../db";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import envConfig from "../../config/envConfig";
import jwt, { SignOptions } from "jsonwebtoken";
import { createAccessToken } from "../../utils/jwt";

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
}
interface LoginUserPayload {
  email: string;
  password: string;
}

// Helper function to get user by email form the database
const getUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: {
            email: email
        }
    })
}
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

  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
 const accessToken = createAccessToken(jwtPayload, envConfig.jwt_access_secret as string, envConfig.jwt_access_expires_in as SignOptions["expiresIn"]);
  const refreshToken = createAccessToken(jwtPayload, envConfig.jwt_refresh_secret as string, envConfig.jwt_refresh_expires_in as SignOptions["expiresIn"]);

  return { user, accessToken, refreshToken };
};

export const authService = {
  registerUser,
  loginUser,
};
