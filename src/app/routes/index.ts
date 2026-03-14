import { Router } from "express";
import { specialtyRouter } from "../module/specialty/specialty.routes";
import { authRouter } from "../module/auth/auth.routes";
import { userRoutes } from "../module/user/user.routes";
import { doctorsRouter } from "../module/doctor/doctor.routes";
import { scheduleRoutes } from "../module/schedule/schedule.routes";
import { appointmentRouter } from "../module/appointment/appointment.routes";
import { DoctorScheduleRoutes } from "../module/doctorSchedule/doctorSchedule.routes";

const router = Router();

router.use("/specialties", specialtyRouter);
router.use("/auth", authRouter);
router.use("/users", userRoutes);
router.use("/doctors", doctorsRouter);
router.use("/schedule", scheduleRoutes);
router.use("/appointments", appointmentRouter);
router.use("/doctorSchedule", DoctorScheduleRoutes)


export const indexRouter = router;