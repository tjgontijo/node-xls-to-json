import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const readJSON = () => {
  const filePath = path.join(process.cwd(), 'database', 'data.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  return data;
};

const createPlano = async (data) => {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('O JSON está vazio ou não está no formato esperado.');
    }

    for (const planoData of data) {
      const {
        planId,
        year,
        state,
        thematicArea,
        diagnosis,
        justification,
        generalGoal,
        implementationStrategy,
        diagnosticImplementationStrategy,
        governanceImplementationStrategy,
        capacityImplementationStrategy,
        acquisitionImplementationStrategy,
        specificGoals,
        resultIndicator,
      } = planoData;

      const plano = await prisma.plan.create({
        data: {
          planId,
          year,
          state,
          thematicArea,
          diagnosis,
          justification,
          generalGoal,
          implementationStrategy,
          diagnosticImplementationStrategy,
          governanceImplementationStrategy,
          capacityImplementationStrategy,
          acquisitionImplementationStrategy,
          resultIndicator,
          specificGoals: {
            create: specificGoals.map(({ goalId, short_name, name, actions }) => ({
              goalId,
              shortName: parseInt(short_name, 10),
              name,
              actions: {
                create: actions.map(({ actionId, actionNum, actionName, items }) => ({
                  actionId,
                  actionNum,
                  actionName,
                  items: {
                    create: items.map(({ itemId, financedItem, itemDescription, senaspItemCode, institution, expenseType, plannedQuantity, measurementUnit, plannedValue, processIndicatorDescription, processIndicatorFormula, periodicity, pmspGoal, pespGoal }) => ({
                      itemId,
                      financedItem,
                      itemDescription,
                      senaspItemCode,
                      institution,
                      expenseType,
                      plannedQuantity,
                      measurementUnit,
                      plannedValue,
                      processIndicatorDescription,
                      processIndicatorFormula,
                      periodicity,
                      pmspGoal,
                      pespGoal,
                    }))
                  }
                }))
              }
            }))
          }
        }
      });

      // Aqui você pode imprimir informações sobre o plano criado
      //console.log(`Plano ${plano.state}-${plano.thematicArea} exportado com sucesso!`);
    }
  } catch (error) {
    console.error('Erro ao criar o plano:', error.message);
  }
};
console.log('Dados inseridos no Banco de Dados com sucesso')
const main = async () => {
  const jsonData = readJSON();
  await createPlano(jsonData);
  await prisma.$disconnect();
};

main();
