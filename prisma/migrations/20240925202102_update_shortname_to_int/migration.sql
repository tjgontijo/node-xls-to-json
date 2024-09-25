/*
  Warnings:

  - The `shortName` column on the `specific_goals` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "specific_goals" DROP COLUMN "shortName",
ADD COLUMN     "shortName" INTEGER;
