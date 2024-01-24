import { CookieOptions, NextFunction, Request, Response } from "express";
import config from "config";
import { createUser, findUser, signToken } from "../services/user.service";
import { CreateUserInput, LoginUserInput } from "../schemas/user.schema";
import AppError from "../utils/appError";

export const excludedFields = ["password"];

const accessTokenCookieOptions: CookieOptions = {
  expires: new Date(
    Date.now() + config.get<number>("accessTokenExpiresIn") * 60 * 1000
  ),
  maxAge: config.get<number>("accessTokenExpiresIn") * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

if (process.env.NODE_ENV === "production") {
  accessTokenCookieOptions.secure = true;
}

export const registerHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    res.status(201).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "Email already exist",
      });
    }

    next(error);
  }
};

export const loginHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findUser({
      email: req.body.email,
    });

    if (
      !user ||
      !(await user.comparePasswords(user.password, req.body.password))
    ) {
      return next(new AppError("Invalid email or password", 401));
    }

    const { accessToken } = await signToken(user);

    res.cookie("jwt_accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    res.status(200).json({
      status: "success",
      accessToken,
    });
  } catch (error: any) {
    next(error);
  }
};
