import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

// Função para ler o arquivo JSON
const readJSON = () => {
  const filePath = path.join(process.cwd(), 'database', 'data.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
};

// Função para criar um diretório com base no nome fixo (sem caminho absoluto)
const createDirectory = () => {
  const directoryPath = path.join(process.cwd(), 'database', 'planilhas'); // Caminho fixo

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  return directoryPath;
};

// Função para criar arquivos Excel separados para cada tabela
const createExcelFiles = (data, directoryPath) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('O JSON está vazio ou não está no formato esperado.');
    return;
  }

  try {
    // Planilha Planos
    const plansData = data.map(plano => ({
      IdPlano: plano.planId,
      Ano: plano.year,
      Estado: plano.state,
      AreaTematica: plano.thematicArea
    }));
    const plansSheet = XLSX.utils.json_to_sheet(plansData);
    const plansWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(plansWorkbook, plansSheet, 'Planos');
    XLSX.writeFile(plansWorkbook, path.join(directoryPath, 'Planos.xlsx'));

    // Planilha Metas Específicas
    const specificGoalsData = data.flatMap(plano =>
      plano.specificGoals.map(goal => ({
        IdMeta: goal.goalId,
        IdPlano: plano.planId,
        NomeCurto: goal.short_name,
        Nome: goal.name
      }))
    );
    const specificGoalsSheet = XLSX.utils.json_to_sheet(specificGoalsData);
    const specificGoalsWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(specificGoalsWorkbook, specificGoalsSheet, 'Metas Específicas');
    XLSX.writeFile(specificGoalsWorkbook, path.join(directoryPath, 'Metas_Especificas.xlsx'));

    // Planilha Ações
    const actionsData = data.flatMap(plano =>
      plano.specificGoals.flatMap(goal =>
        goal.actions.map(action => ({
          IdAcao: action.actionId,
          IdMeta: goal.goalId,
          NumeroAcao: action.actionNum,
          NomeAcao: action.actionName
        }))
      )
    );
    const actionsSheet = XLSX.utils.json_to_sheet(actionsData);
    const actionsWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(actionsWorkbook, actionsSheet, 'Acoes');
    XLSX.writeFile(actionsWorkbook, path.join(directoryPath, 'Acoes.xlsx'));

    // Planilha Itens
    const itemsData = data.flatMap(plano =>
      plano.specificGoals.flatMap(goal =>
        goal.actions.flatMap(action =>
          action.items.map(item => ({
            IdItem: item.itemId,
            IdAcao: action.actionId,
            ItemFinanciado: item.financedItem,
            Instituicao: item.institution,
            TipoDespesa: item.expenseType,
            QuantidadePlanejada: item.plannedQuantity,
            ValorPlanejado: item.plannedValue,
            UnidadeMedida: item.measurementUnit,
            CodigoSenasp: item.senaspItemCode
          }))
        )
      )
    );
    const itemsSheet = XLSX.utils.json_to_sheet(itemsData);
    const itemsWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(itemsWorkbook, itemsSheet, 'Itens');
    XLSX.writeFile(itemsWorkbook, path.join(directoryPath, 'Itens.xlsx'));

    console.log(`Os arquivos Excel foram salvos no diretório ${directoryPath}.`);
  } catch (error) {
    console.error('Erro ao criar os arquivos Excel:', error.message);
  }
};

// Função principal para processar o JSON e criar os arquivos Excel
const main = async () => {
  try {
    const jsonData = readJSON();

    if (!jsonData) {
      console.error('Processamento interrompido devido a erro ao ler o JSON.');
      return;
    }

    // Voltar para o salvamento automático em um diretório padrão
    const directoryPath = createDirectory(); // Usando o diretório fixo como antes

    createExcelFiles(jsonData, directoryPath);
  } catch (error) {
    console.error('Erro inesperado durante a execução do programa:', error.message);
  }
};

main();
