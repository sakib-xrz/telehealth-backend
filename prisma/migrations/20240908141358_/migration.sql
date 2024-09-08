/*
  Warnings:

  - You are about to drop the column `instructions` on the `prescriptions` table. All the data in the column will be lost.
  - Added the required column `medicines` to the `prescriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tests` to the `prescriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "instructions",
ADD COLUMN     "medicines" JSONB NOT NULL,
ADD COLUMN     "tests" JSONB NOT NULL;
