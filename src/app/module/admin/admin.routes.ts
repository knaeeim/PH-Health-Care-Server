import { Router } from "express";
import { updateAdminZodSchema } from "./admin.validation";
import { validateRequest } from "../../shared/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { AdminController } from "./admin.controller";
import { checkAuth } from "../../../middleware/checkAuth";

const router = Router();

router.get("/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAllAdmins);
router.get("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAdminById);
router.patch("/:id",
    checkAuth(Role.SUPER_ADMIN),
    validateRequest(updateAdminZodSchema), AdminController.updateAdmin);
router.delete("/:id",
    checkAuth(Role.SUPER_ADMIN),
    AdminController.deleteAdmin);



export const adminRoutes = router;