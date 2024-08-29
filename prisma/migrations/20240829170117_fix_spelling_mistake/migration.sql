/*
  Warnings:

  - You are about to drop the column `designaton` on the `doctors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "designaton",
ADD COLUMN     "designation" TEXT,
ALTER COLUMN "experience" DROP NOT NULL;
