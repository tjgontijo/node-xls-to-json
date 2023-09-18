/*
  Warnings:

  - Added the required column `resultIndicator` to the `plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "resultIndicator" TEXT NOT NULL;
