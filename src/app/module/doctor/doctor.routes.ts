import { Router } from "express";
import { doctorController } from "./doctor.controller";

const router = Router();

router.get('/all-doctors', doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.put("/:id", doctorController.updateDoctor);


export const doctorsRouter = router;