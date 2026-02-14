import { Router } from "express";
import { specialtyRouter } from "../module/specialty/specialty.routes";
import { authRouter } from "../module/auth/auth.routes";
import { userRoutes } from "../module/user/user.routes";

const router = Router();

router.use("/specialties", specialtyRouter);
router.use("/auth", authRouter);
router.use("/users", userRoutes);


export const indexRouter = router;