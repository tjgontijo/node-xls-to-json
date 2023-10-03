import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateActionNums() {
  const problematicCombinations = await prisma.$queryRaw`
    SELECT
        PLANS."state", 
        PLANS."thematicArea",
        SPECIFIC_GOALS."shortName",
        ACTIONS."actionName"
    FROM ACTIONS
    JOIN SPECIFIC_GOALS ON SPECIFIC_GOALS."goalId" = ACTIONS."goalId"
    JOIN PLANS ON SPECIFIC_GOALS."planId" = PLANS."planId"
    GROUP BY PLANS."state", PLANS."thematicArea", SPECIFIC_GOALS."shortName", ACTIONS."actionName"
    HAVING COUNT(DISTINCT ACTIONS."actionNum") > 1
`;

  for (const combo of problematicCombinations) {
    const { state, thematicArea, shortName, actionName } = combo;

    const firstAction = await prisma.action.findFirst({
      where: {
        actionName: actionName,
        specificGoal: {
          shortName: shortName,
          plan: {
            state: state,
            thematicArea: thematicArea
          }
        }
      },
      orderBy: {
        actionNum: 'asc'
      }
    });

    if (firstAction) {
      const firstActionId = firstAction.actionId;
      const firstActionNum = firstAction.actionNum;

      // Atualizar actionNum em ações
      await prisma.action.updateMany({
        where: {
          actionName: actionName,
          NOT: {
            actionNum: firstActionNum
          },
          specificGoal: {
            shortName: shortName,
            plan: {
              state: state,
              thematicArea: thematicArea
            }
          }
        },
        data: {
          actionNum: firstActionNum
        }
      });

      // Atualizar actionId em itens
      await prisma.item.updateMany({
        where: {
          action: {
            actionName: actionName,
            NOT: {
              actionId: firstActionId
            }
          }
        },
        data: {
          actionId: firstActionId
        }
      });
    }
  }
}

updateActionNums()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
