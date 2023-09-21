-- AlterTable
ALTER TABLE "actions" ALTER COLUMN "actionNum" DROP NOT NULL,
ALTER COLUMN "actionName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "items" ALTER COLUMN "financedItem" DROP NOT NULL,
ALTER COLUMN "itemDescription" DROP NOT NULL,
ALTER COLUMN "senaspItemCode" DROP NOT NULL,
ALTER COLUMN "institution" DROP NOT NULL,
ALTER COLUMN "expenseType" DROP NOT NULL,
ALTER COLUMN "plannedQuantity" DROP NOT NULL,
ALTER COLUMN "measurementUnit" DROP NOT NULL,
ALTER COLUMN "plannedValue" DROP NOT NULL,
ALTER COLUMN "processIndicatorDescription" DROP NOT NULL,
ALTER COLUMN "processIndicatorFormula" DROP NOT NULL,
ALTER COLUMN "periodicity" DROP NOT NULL,
ALTER COLUMN "pmspGoal" DROP NOT NULL,
ALTER COLUMN "pespGoal" DROP NOT NULL;

-- AlterTable
ALTER TABLE "plans" ALTER COLUMN "diagnosis" DROP NOT NULL,
ALTER COLUMN "justification" DROP NOT NULL,
ALTER COLUMN "generalGoal" DROP NOT NULL,
ALTER COLUMN "implementationStrategy" DROP NOT NULL,
ALTER COLUMN "diagnosticImplementationStrategy" DROP NOT NULL,
ALTER COLUMN "governanceImplementationStrategy" DROP NOT NULL,
ALTER COLUMN "capacityImplementationStrategy" DROP NOT NULL,
ALTER COLUMN "acquisitionImplementationStrategy" DROP NOT NULL,
ALTER COLUMN "resultIndicator" DROP NOT NULL;

-- AlterTable
ALTER TABLE "specific_goals" ALTER COLUMN "shortName" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;
