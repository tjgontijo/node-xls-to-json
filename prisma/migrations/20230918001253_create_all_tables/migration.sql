-- CreateTable
CREATE TABLE "plans" (
    "planId" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "thematicArea" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "generalGoal" TEXT NOT NULL,
    "implementationStrategy" TEXT NOT NULL,
    "diagnosticImplementationStrategy" TEXT NOT NULL,
    "governanceImplementationStrategy" TEXT NOT NULL,
    "capacityImplementationStrategy" TEXT NOT NULL,
    "acquisitionImplementationStrategy" TEXT NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("planId")
);

-- CreateTable
CREATE TABLE "specific_goals" (
    "goalId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "specific_goals_pkey" PRIMARY KEY ("goalId")
);

-- CreateTable
CREATE TABLE "actions" (
    "actionId" TEXT NOT NULL,
    "actionNum" TEXT NOT NULL,
    "actionName" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("actionId")
);

-- CreateTable
CREATE TABLE "items" (
    "itemId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "financedItem" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "senaspItemCode" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "expenseType" TEXT NOT NULL,
    "plannedQuantity" INTEGER NOT NULL,
    "measurementUnit" TEXT NOT NULL,
    "plannedValue" DOUBLE PRECISION NOT NULL,
    "processIndicatorDescription" TEXT NOT NULL,
    "processIndicatorFormula" TEXT NOT NULL,
    "periodicity" TEXT NOT NULL,
    "pmspGoal" TEXT NOT NULL,
    "pespGoal" TEXT NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("itemId")
);

-- AddForeignKey
ALTER TABLE "specific_goals" ADD CONSTRAINT "specific_goals_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("planId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "specific_goals"("goalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "actions"("actionId") ON DELETE RESTRICT ON UPDATE CASCADE;
