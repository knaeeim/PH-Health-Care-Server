import { Router } from "express";
import { specialtyRouter } from "../module/specialty/specialty.routes";
import { authRouter } from "../module/auth/auth.routes";

const router = Router();

router.use("/specialties", specialtyRouter);
router.use("/auth", authRouter)


export const indexRouter = router;