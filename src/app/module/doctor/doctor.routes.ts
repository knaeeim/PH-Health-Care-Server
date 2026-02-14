import { Router } from "express";
import { doctorController } from "./doctor.controller";

const router = Router();

router.get('/all-doctors', doctorController.getAllDoctors);


export const doctorsRouter = router;