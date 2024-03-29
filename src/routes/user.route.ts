import express from "express";
import { deserializeUser } from "../middleware/deserializeUser";
import { requireUser } from "../middleware/requireUser";
import { restrictTo } from "../middleware/restrictTo";
import {
  getAllUsersHandler,
  getMeHandler,
} from "../controller/user.controller";

const router = express.Router();

router.use(deserializeUser, requireUser);

router.get("/", restrictTo("admin"), getAllUsersHandler);
router.get("/me", getMeHandler);

export default router;
