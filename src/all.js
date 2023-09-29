import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

const directoryPath = 'C:/Users/thiago.gontijo/OneDrive - MINISTERIO DA JUSTIÇA/Planilhas';
const allResults = [];
const sheetName = 'Plano';

const startingCells = {
  "metaNum": "A",
  "actionNum": "B",
  "adherenceArt5": "C",
  "financedItem": "D",
  "itemDescription": "E",
  "senaspItemCode": "F",
  "institution": "G",
  "expenseType": "H",
  "plannedQuantity": "I",
  "measurementUnit": "J",
  "plannedValue": "K",
  "processIndicatorDescription": "L",
  "processIndicatorFormula": "M",
  "periodicity": "N",
  "pmspGoal": "O",
  "pespGoal": "P"
};

function isRowEmpty(sheet, rowNumber) {
  for (const column of Object.values(startingCells)) {
    const cellAddress = column + rowNumber;
    const cell = sheet[cellAddress];
    if (cell && cell.v !== undefined && cell.v !== null) {
      return false;
    }
  }
  return true;
}

function logError(filePath, error) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - Erro ao processar o arquivo: ${path.basename(filePath)}\n${error}\n\n`;
  fs.appendFileSync('log/error_all.txt', logMessage, 'utf-8');
}

function processFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];

    const match = path.basename(filePath).match(/^(.*?) - (.*?) -/);
    if (match) {
      const state = match[1];
      const thematicArea = match[2];

      const idPlanGenerate = uuidv4();

      function getCellValue(sheet, cell) {
        if (sheet[cell] && typeof sheet[cell].v === "string") {
          const value = sheet[cell].v.trim(); // Remove espaços em branco e quebras de linha no início e no final
          return value !== "" ? value : "Não informado";
        }
        return "Não informado";
      }

      const resultEntry = {
        "planId": idPlanGenerate,
        "year": sheet['M1'] ? sheet['M1'].v : 2023,
        "state": state,
        "thematicArea": thematicArea,
        "diagnosis": getCellValue(sheet, 'B19'),
        "justification": getCellValue(sheet, 'B20'),
        "generalGoal": getCellValue(sheet, 'B21'),
        "implementationStrategy": getCellValue(sheet, 'B23'),
        "diagnosticImplementationStrategy": getCellValue(sheet, 'B25'),
        "governanceImplementationStrategy": getCellValue(sheet, 'B27'),
        "capacityImplementationStrategy": getCellValue(sheet, 'B29'),
        "acquisitionImplementationStrategy": getCellValue(sheet, 'B31'),
        "resultIndicator": getCellValue(sheet, 'B32'),
        "specificGoals": []
      };
      const mergedCellRange = 'B33:D50';
      const { s, e } = XLSX.utils.decode_range(mergedCellRange);
      let currentNumber;

      for (let rowIndex = s.r; rowIndex <= e.r; rowIndex++) {
        for (let colIndex = s.c; colIndex <= e.c; colIndex++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
          const cell = sheet[cellAddress];
          const goalIdGenerate = uuidv4();
          if (colIndex === s.c) {
            currentNumber = cell ? cell.v : null;
          } else if (cell && cell.v !== undefined && currentNumber !== null) {
            const entry = {
              goalId: goalIdGenerate,
              planId: idPlanGenerate,
              short_name: currentNumber,
              name: cell.v,
              actions: []
            };
            resultEntry["specificGoals"].push(entry);
          }
        }
      }

      allResults.push(resultEntry);

      for (let rowIndex = 55; rowIndex <= 1000; rowIndex++) {
        if (isRowEmpty(sheet, rowIndex)) continue;

        const currentMetaNum = sheet[startingCells["metaNum"] + rowIndex].v;
        const currentActionNum = sheet[startingCells["actionNum"] + rowIndex].v;
        const currentActionName = sheet[startingCells["adherenceArt5"] + rowIndex].v;
        const existingMeta = resultEntry["specificGoals"].find(meta => meta.short_name === currentMetaNum);

        let goalIdGenerate = uuidv4();

        if (existingMeta) {
          let actionObj = existingMeta["actions"].find(action => action["actionNum"] === currentActionNum);
          if (!actionObj) {
            const actionIdGenerate = uuidv4();
            actionObj = {
              actionId: actionIdGenerate,
              goalId: goalIdGenerate,
              actionNum: currentActionNum,
              actionName: currentActionName,
              items: []
            };
            existingMeta["actions"].push(actionObj);
          }

          const itemData = {
            itemId: uuidv4(),
            actionId: actionObj.actionId,
            financedItem: sheet[startingCells["financedItem"] + rowIndex] ? sheet[startingCells["financedItem"] + rowIndex].v : "Não informado",
            itemDescription: sheet[startingCells["itemDescription"] + rowIndex] ? sheet[startingCells["itemDescription"] + rowIndex].v : "Não informado",
            senaspItemCode: sheet[startingCells["senaspItemCode"] + rowIndex] ? sheet[startingCells["senaspItemCode"] + rowIndex].v : "Não informado",
            institution: sheet[startingCells["institution"] + rowIndex] ? sheet[startingCells["institution"] + rowIndex].v : "Não informado",
            expenseType: sheet[startingCells["expenseType"] + rowIndex] ? sheet[startingCells["expenseType"] + rowIndex].v : "Não informado",
            plannedQuantity: sheet[startingCells["plannedQuantity"] + rowIndex] ? sheet[startingCells["plannedQuantity"] + rowIndex].v : 0,
            measurementUnit: sheet[startingCells["measurementUnit"] + rowIndex] ? sheet[startingCells["measurementUnit"] + rowIndex].v : "Não informado",
            plannedValue: sheet[startingCells["plannedValue"] + rowIndex] ? sheet[startingCells["plannedValue"] + rowIndex].v : 0,
            processIndicatorDescription: sheet[startingCells["processIndicatorDescription"] + rowIndex] ? sheet[startingCells["processIndicatorDescription"] + rowIndex].v : "Não informado",
            processIndicatorFormula: sheet[startingCells["processIndicatorFormula"] + rowIndex] ? sheet[startingCells["processIndicatorFormula"] + rowIndex].v : "Não informado",
            periodicity: sheet[startingCells["periodicity"] + rowIndex] ? sheet[startingCells["periodicity"] + rowIndex].v : "Não informado",
            pmspGoal: sheet[startingCells["pmspGoal"] + rowIndex] ? sheet[startingCells["pmspGoal"] + rowIndex].v : "Não informado",
            pespGoal: sheet[startingCells["pespGoal"] + rowIndex] ? sheet[startingCells["pespGoal"] + rowIndex].v : "Não informado",
          };
          for (let key in itemData) {
            itemData[key] = typeof itemData[key] === "string" ? itemData[key].replace(/\s+/g, ' ').trim() : itemData[key];
          }
          actionObj["items"].push(itemData);
        }
      }
    } else {
      console.error('Nome de arquivo não corresponde ao padrão esperado:', path.basename(filePath));
    }
  } catch (error) {
    logError(filePath, error);
  }
}

function processDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else {
      processFile(filePath);
    }
  }
}

processDirectory(directoryPath);

fs.writeFile('database/data.json', JSON.stringify(allResults, null, 2), (err) => {
  if (err) throw err;
  console.log('Os dados foram salvos em database/data.json.');
});
