import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log("HIT", req.originalUrl);
    try {
      schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
      });

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "fail",
          error: error.errors,
        });
      }

      next(error);
    }
  };
