import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { checkAuth } from "../../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get('/all-doctors', doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.put("/:id", checkAuth(Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN), doctorController.updateDoctor);
router.put("/delete/:id", checkAuth(Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN), doctorController.deleteDoctor);


export const doctorsRouter = router;