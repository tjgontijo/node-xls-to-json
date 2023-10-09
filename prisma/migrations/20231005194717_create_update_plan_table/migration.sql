-- CreateTable
CREATE TABLE "update_plans" (
    "itemId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "thematicArea" TEXT NOT NULL,
    "last_update" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "update_plans_pkey" PRIMARY KEY ("itemId")
);
