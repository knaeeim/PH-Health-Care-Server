import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register-patient", authController.registerPatient);


export const authRouter = router;