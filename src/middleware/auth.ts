import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import httpStatus from "http-status";
import { verifyToken } from "../utils/jwt";
import envConfig from "../config/envConfig";
import { prisma } from "../db";
import { Role } from "../../generated/prisma/enums";
import catchAsync from "../utils/catchAsync";
import { JwtPayload } from "../modules/auth/auth.interface";

const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email: email,
    },
  });
};
const auth = (...requiredRoles: Role[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.cookies.accessToken
    if (!authHeader) {
      throw new AppError("Unauthorized", httpStatus.UNAUTHORIZED);
    }
    const token = authHeader;
    const decoded = verifyToken(
      token as string,
      envConfig.jwt_access_secret,
    ) as JwtPayload;
    const user = await getUserByEmail(decoded.email);
    if (!user) {
      throw new AppError("User not found", httpStatus.NOT_FOUND);
    }
    if (user.status === "BLOCKED") {
      throw new AppError("User is blocked", httpStatus.FORBIDDEN);
    }
    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        throw new AppError("You are not allowed to access this route", httpStatus.FORBIDDEN);
    }
    req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
    }
    next();
  });

export default auth;
