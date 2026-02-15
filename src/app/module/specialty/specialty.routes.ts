import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { checkAuth } from "../../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create-specialty", specialtyController.createSpecialty);
router.get("/all-specialties", checkAuth(Role.PATIENT), specialtyController.getAllSpecialties);
router.delete("/delete/:id", specialtyController.deleteSpecialty);
router.put("/update/:id", specialtyController.updateSpecialty);


export const specialtyRouter = router;