import { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { appointmentController } from "./appointment.controller";
import { validateRequest } from "../../shared/validateRequest";
import { appointmentValidation } from "./appointment.validation";

const router = Router();

router.post("/book-appointment", checkAuth(Role.PATIENT), validateRequest(appointmentValidation.bookAppointmentZodSchema), appointmentController.bookAppointment);
router.get("/my-appointments", checkAuth(Role.PATIENT, Role.DOCTOR), appointmentController.getMyAppointments);
router.patch("/change-appointment-status/:id", checkAuth(Role.DOCTOR), validateRequest(appointmentValidation.changeAppointmentStatusZodSchema), appointmentController.changeAppointmentStatus);
router.get("/my-single-appointment/:id", checkAuth(Role.PATIENT, Role.DOCTOR), appointmentController.getMySingleAppointment);
router.get("/all-appointments", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), appointmentController.getAllAppointments);
router.post("/book-appointment-with-pay-later", checkAuth(Role.PATIENT), validateRequest(appointmentValidation.bookAppointmentZodSchema), appointmentController.bookAppointmentWithPayLater);
router.post("/initiate-payment/:id", checkAuth(Role.PATIENT), appointmentController.initiatePayment);




export const appointmentRouter = router;