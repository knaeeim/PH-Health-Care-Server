import { addHours, addMinutes, format } from "date-fns";
import { ICreateSchedulePayload, IUpdateSchedulePayload } from "./schedule.interface";
import { convertDateTime } from "./schedule.utils";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Prisma, Schedule } from "../../../generated/prisma/client";
import { scheduleFilterableFields, scheduleIncludeConfig, scheduleSearchableFields } from "./schedule.constant";

const createSchedule = async (payload: ICreateSchedulePayload) => {
    const { startDate, endDate, startTime, endTime } = payload;

    // We are assuming that the per session would be 30 minutes. We will create sessions accordingly
    const interval = 30;

    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    const schedules = [];

    // Less than equal beacuse of the last date also be the current Date, where time will defer from the start time to end time
    while (currentDate <= lastDate) {

        const startDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(startTime.split(":")[0])
                ),
                Number(startTime.split(":")[1])
            )
        )

        console.log("startDate Time from While Loop", startDateTime);

        const endDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(endTime.split(":")[0])
                ),
                Number(endTime.split(":")[1])
            )
        )
        console.log("endDate Time from While Loop", endDateTime);

        while (startDateTime < endDateTime) {
            const s = await convertDateTime(startDateTime);
            const e = await convertDateTime(addMinutes(startDateTime, interval));

            console.log("s time after convertedDate time", s);
            console.log("e time after convertedDate time", e);

            const scheduleData = {
                startDateTime: s,
                endDateTime: e
            }

            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime
                }
            })

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData
                })
                console.log(result);
                schedules.push(result);
            }

            startDateTime.setMinutes(startDateTime.getMinutes() + interval);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
}

const getAllSchedules = async (query: IQueryParams) => {

    const queryBuilder = new QueryBuilder<Schedule, Prisma.ScheduleWhereInput, Prisma.ScheduleInclude>(
        prisma.schedule,
        query,
        {
            searchableFields: scheduleSearchableFields,
            filterableFields: scheduleFilterableFields
        }
    )
    const result = await queryBuilder
        .search()
        .filter()
        .paginate()
        .paginate()
        .dynamicInclude(scheduleIncludeConfig)
        .sort()
        .fields()
        .execute();

    return result;
}

const getScheduleById = async (id: string) => {
    const schedule = await prisma.schedule.findUnique({
        where: {
            id: id
        }
    });
    return schedule;
}

const updateSchedule = async (id: string, payload: IUpdateSchedulePayload) => {
    const { startDate, endDate, startTime, endTime } = payload;

    const startDateTime = new Date(
        addMinutes(
            addHours(
                `${format(new Date(startDate), "yyyy-MM-dd")}`,
                Number(startTime.split(":")[0])
            ),
            Number(startTime.split(":")[1])
        )
    )

    const endDateTime = new Date(
        addMinutes(
            addHours(
                `${format(new Date(endDate), "yyyy-MM-dd")}`,
                Number(endTime.split(":")[0])
            ),
            Number(endTime.split(":")[1])
        )
    )

    const updateSchedule = await prisma.schedule.update({
        where: {
            id
        },
        data: {
            startDateTime: startDateTime,
            endDateTime: endDateTime
        }
    })

    return updateSchedule;
}

const deleteSchedule = async (id: string) => {
    await prisma.schedule.delete({
        where: {
            id: id
        }
    });
    return true;
}


export const scheduleServices = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
}