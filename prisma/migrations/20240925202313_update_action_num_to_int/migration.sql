/*
  Warnings:

  - The `actionNum` column on the `actions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "actions" DROP COLUMN "actionNum",
ADD COLUMN     "actionNum" INTEGER;
