import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { checkAuth } from "../../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerConfig } from "../../config/multer.config";
import { validateRequest } from "../../shared/validateRequest";
import { specialtyValidation } from "./specialty.validation";

const router = Router();

router.post("/create-specialty",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerConfig.single("file"),
    validateRequest(specialtyValidation.createSpecialtyZodSchema),
    specialtyController.createSpecialty);
router.get("/all-specialties", checkAuth(Role.PATIENT), specialtyController.getAllSpecialties);
router.delete("/delete/:id", specialtyController.deleteSpecialty);
router.put("/update/:id", specialtyController.updateSpecialty);


export const specialtyRouter = router;