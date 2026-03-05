/*
  Warnings:

  - You are about to drop the column `endDate` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `endDateTime` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDateTime` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "endDate",
DROP COLUMN "endTime",
DROP COLUMN "startDate",
DROP COLUMN "startTime",
ADD COLUMN     "endDateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDateTime" TIMESTAMP(3) NOT NULL;
