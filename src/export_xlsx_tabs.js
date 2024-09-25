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

// Função para criar um arquivo Excel com múltiplas abas
const createExcelWithSheets = (data, directoryPath) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('O JSON está vazio ou não está no formato esperado.');
    return;
  }

  try {
    const workbook = XLSX.utils.book_new(); // Criar um único workbook

    // Planilha Planos
    const plansData = data.map(plano => ({
      IdPlano: plano.planId,
      Ano: plano.year,
      Estado: plano.state,
      AreaTematica: plano.thematicArea
    }));
    const plansSheet = XLSX.utils.json_to_sheet(plansData);
    XLSX.utils.book_append_sheet(workbook, plansSheet, 'Planos');

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
    XLSX.utils.book_append_sheet(workbook, specificGoalsSheet, 'Metas Específicas');

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
    XLSX.utils.book_append_sheet(workbook, actionsSheet, 'Acoes');

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
    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Itens');

    // Salvar o arquivo Excel com todas as abas
    XLSX.writeFile(workbook, path.join(directoryPath, 'Dados_Completos.xlsx'));

    console.log(`O arquivo Excel com múltiplas abas foi salvo no diretório ${directoryPath}.`);
  } catch (error) {
    console.error('Erro ao criar o arquivo Excel:', error.message);
  }
};

// Função principal para processar o JSON e criar o arquivo Excel
const main = async () => {
  try {
    const jsonData = readJSON();

    if (!jsonData) {
      console.error('Processamento interrompido devido a erro ao ler o JSON.');
      return;
    }

    const directoryPath = createDirectory(); // Usando o diretório fixo como antes

    createExcelWithSheets(jsonData, directoryPath);
  } catch (error) {
    console.error('Erro inesperado durante a execução do programa:', error.message);
  }
};

main();
