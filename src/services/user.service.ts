import { omit } from "lodash";
import userModel, { User } from "../models/user.model";
import { FilterQuery, QueryOptions } from "mongoose";
import { DocumentType } from "@typegoose/typegoose";
import { signJwt } from "../utils/jwt";
import config from "config";
import redisClient from "../utils/connectRedis";
import { excludedFields } from "../controller/auth.controller";

export const createUser = async (input: Partial<User>) => {
  const user = await userModel.create(input);
  return omit(user.toJSON(), excludedFields);
};

export const findUserById = async (id: string) => {
  const user = userModel.findById(id).lean();
};

export const findAllUsers = async () => {
  return await userModel.find();
};

export const findUser = async (
  query: FilterQuery<User>,
  options: QueryOptions = {}
) => {
  return await userModel.findOne(query, {}, options).select("+password");
};

export const signToken = async (user: DocumentType<User>) => {
  const access_token = signJwt(
    { sub: user._id },
    {
      expiresIn: `${config.get<number>("accessTokenExpiresIn")}m`,
    }
  );

  redisClient.set(user._id.toString(), JSON.stringify(user), {
    EX: 60 * 60,
  });

  return { access_token };
};
