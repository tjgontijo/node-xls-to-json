import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

const directoryPath = 'C:/Users/thiago.gontijo/OneDrive - MINISTERIO DA JUSTIÇA/DSUSP/Planilhas';
const allResults = [];
const sheetName = 'Plano';

const startingCells = {
  "metaNum": "A",
  "actionNum": "B",
  "adherence439": "C",
  "adherence685": "D",
  "materialService": "E",
  "itemDescription": "F",
  "destination": "G",
  "senaspItemCode": "H",
  "institution": "I",
  "expenseType": "J",
  "plannedQuantity": "K",
  "plannedValue": "L",
  "measurementUnit": "M",
  "processIndicatorDescription": "N",
  "processIndicatorFormula": "O",
  "periodicity": "P",
  "pnspGoal": "Q",
  "pespGoal": "R"
};

function isRowEmpty(sheet, rowNumber) {
  const metaCell = sheet[startingCells["metaNum"] + rowNumber];
  const actionCell = sheet[startingCells["actionNum"] + rowNumber];
  return (!metaCell || metaCell.v === undefined || metaCell.v === null) &&
    (!actionCell || actionCell.v === undefined || actionCell.v === null);
}

function logError(filePath, error) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - Erro ao processar o arquivo: ${path.basename(filePath)}\n${error}\n\n`;
  fs.appendFileSync('log/error_all.txt', logMessage, 'utf-8');
}

function normalizeNumber(value) {
  return typeof value === 'string' ? Number(value) : value;
}

function cleanText(text) {
  return typeof text === "string" ? text.replace(/\r?\n|\r/g, ' ').replace(/\s{2,}/g, ' ').trim() : text;
}

function processFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];
    const match = path.basename(filePath).match(/^(.*?) - (.*?) -/);
    if (match) {
      const state = match[1];
      const thematicArea = match[2];
      const directoryName = path.basename(path.dirname(filePath));
      const year = parseInt(directoryName.slice(-4)); // Converte para Int
      const idPlanGenerate = uuidv4();

      const resultEntry = {
        "planId": idPlanGenerate,
        "year": year,
        "state": state,
        "thematicArea": thematicArea,
        "diagnosis": cleanText(sheet['B19']?.v || "Não informado"),
        "justification": cleanText(sheet['B20']?.v || "Não informado"),
        "generalGoal": cleanText(sheet['B21']?.v || "Não informado"),
        "implementationStrategy": cleanText(sheet['B23']?.v || "Não informado"),
        "diagnosticImplementationStrategy": cleanText(sheet['B25']?.v || "Não informado"),
        "governanceImplementationStrategy": cleanText(sheet['B27']?.v || "Não informado"),
        "capacityImplementationStrategy": cleanText(sheet['B29']?.v || "Não informado"),
        "acquisitionImplementationStrategy": cleanText(sheet['B31']?.v || "Não informado"),
        "resultIndicator": cleanText(sheet['B32']?.v || "Não informado"),
        "specificGoals": []
      };

      const mergedCellRange = 'B33:E50';
      const { s, e } = XLSX.utils.decode_range(mergedCellRange);
      let currentNumber;

      for (let rowIndex = s.r; rowIndex <= e.r; rowIndex++) {
        for (let colIndex = s.c; colIndex <= e.c; colIndex++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
          const cell = sheet[cellAddress];
          const goalIdGenerate = uuidv4();
          if (colIndex === s.c) {
            currentNumber = cell ? normalizeNumber(cell.v) : null;
          } else if (cell && cell.v !== undefined && currentNumber !== null) {
            resultEntry["specificGoals"].push({
              goalId: goalIdGenerate,
              planId: idPlanGenerate,
              short_name: parseInt(currentNumber, 10),
              name: cleanText(cell.v),
              actions: []
            });
          }
        }
      }

      let emptyRowCount = 0;
      for (let rowIndex = 55; rowIndex <= 1000; rowIndex++) {
        if (isRowEmpty(sheet, rowIndex)) {
          emptyRowCount++;
          if (emptyRowCount >= 5) break;
          continue;
        }

        emptyRowCount = 0;

        const currentMetaNum = normalizeNumber(sheet[startingCells["metaNum"] + rowIndex]?.v);
        const currentActionNum = normalizeNumber(sheet[startingCells["actionNum"] + rowIndex]?.v);
        const currentActionName = cleanText(sheet[startingCells["adherence685"] + rowIndex]?.v || sheet[startingCells["adherence439"] + rowIndex]?.v || "Não informado");

        let existingMeta = resultEntry["specificGoals"].find(meta => normalizeNumber(meta.short_name) === currentMetaNum);

        if (!existingMeta) continue;

        let actionObj = existingMeta["actions"].find(action => normalizeNumber(action["actionNum"]) === currentActionNum);

        if (!actionObj) {
          const actionIdGenerate = uuidv4();
          actionObj = {
            actionId: actionIdGenerate,
            goalId: existingMeta.goalId,
            actionNum: currentActionNum,
            actionName: currentActionName,
            items: []
          };
          existingMeta["actions"].push(actionObj);
        }

        const itemData = {
          itemId: uuidv4(),
          actionId: actionObj.actionId,
          financedItem: cleanText(sheet[startingCells["materialService"] + rowIndex]?.v || "Não informado"),
          itemDescription: cleanText(sheet[startingCells["itemDescription"] + rowIndex]?.v || "Não informado"),
          destination: cleanText(sheet[startingCells["destination"] + rowIndex]?.v || "Não informado"),
          senaspItemCode: cleanText(sheet[startingCells["senaspItemCode"] + rowIndex]?.v || "Não informado"),
          institution: cleanText(sheet[startingCells["institution"] + rowIndex]?.v || "Não informado"),
          expenseType: cleanText(sheet[startingCells["expenseType"] + rowIndex]?.v || "Não informado"),
          plannedQuantity: Number(sheet[startingCells["plannedQuantity"] + rowIndex] ? sheet[startingCells["plannedQuantity"] + rowIndex].v : 0), // Quantidade Planejada (convertido para número)
          plannedValue: parseFloat(sheet[startingCells["plannedValue"] + rowIndex] ? sheet[startingCells["plannedValue"] + rowIndex].v : 0), // Valor Planejado (convertido para float)
          measurementUnit: cleanText(sheet[startingCells["measurementUnit"] + rowIndex]?.v || "Não informado"),
          processIndicatorDescription: cleanText(sheet[startingCells["processIndicatorDescription"] + rowIndex]?.v || "Não informado"),
          processIndicatorFormula: cleanText(sheet[startingCells["processIndicatorFormula"] + rowIndex]?.v || "Não informado"),
          periodicity: cleanText(sheet[startingCells["periodicity"] + rowIndex]?.v || "Não informado"),
          pnspGoal: cleanText(sheet[startingCells["pnspGoal"] + rowIndex]?.v || "Não informado"),
          pespGoal: cleanText(sheet[startingCells["pespGoal"] + rowIndex]?.v || "Não informado")
        };

        actionObj["items"].push(itemData);
      }

      allResults.push(resultEntry);
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
});
