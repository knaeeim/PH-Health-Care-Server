import { Router } from "express";
import { specialtyController } from "./specialty.controller";

const router = Router();

router.post("/create-specialty", specialtyController.createSpecialty);
router.get("/all-specialties", specialtyController.getAllSpecialties);
router.delete("/delete/:id", specialtyController.deleteSpecialty);
router.put("/update/:id", specialtyController.updateSpecialty);


export const specialtyRouter = router;