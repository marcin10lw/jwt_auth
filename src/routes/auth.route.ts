import express from "express";
import { loginHandler, registerHandler } from "../controller/auth.controller";
import { validate } from "../middleware/validate";
import { createUserSchema, loginUserSchema } from "../schemas/user.schema";

const router = express.Router();

router.post("/register", validate(createUserSchema), registerHandler);
router.post("/login", validate(loginUserSchema), loginHandler);

export default router;
