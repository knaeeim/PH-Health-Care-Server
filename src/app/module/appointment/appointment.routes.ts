import { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { appointmentController } from "./appointment.controller";
import { validateRequest } from "../../shared/validateRequest";
import { appointmentValidation } from "./appointment.validation";

const router = Router();

router.post("/book-appointment", checkAuth(Role.PATIENT), validateRequest(appointmentValidation.bookAppointmentZodSchema), appointmentController.bookAppointment);





export const appointmentRouter = router;