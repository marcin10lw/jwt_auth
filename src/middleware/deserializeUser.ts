import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_COOKIE_NAME } from "../constants";
import AppError from "../utils/appError";
import { verifyJwt } from "../utils/jwt";
import redisClient from "../utils/connectRedis";
import { findUserById } from "../services/user.service";

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let accessToken;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      accessToken = req.headers.authorization.split(" ")[1];
    } else if (req.cookies[ACCESS_TOKEN_COOKIE_NAME]) {
      accessToken = req.cookies[ACCESS_TOKEN_COOKIE_NAME];
    }

    if (!accessToken) {
      return next(new AppError("You are not logged in", 401));
    }

    const decoded = verifyJwt<{ sub: string }>(accessToken);

    if (!decoded) {
      return next(new AppError("Invalid token or user doesn't exist", 401));
    }

    const session = await redisClient.get(decoded.sub);

    if (!session) {
      return next(new AppError("User session has expired", 401));
    }

    const user = await findUserById(JSON.parse(session)._id);

    if (!user) {
      return next(new AppError("User with that token no longer exist", 401));
    }

    res.locals.user = user;
  } catch (error: any) {
    next(error);
  }
};
