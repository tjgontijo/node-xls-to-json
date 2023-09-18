import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

const directoryPath = './assets/planilhas';
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

fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.error('Erro ao ler o diretório:', err);
  }

  files.forEach(function (file) {
    const filePath = path.join(directoryPath, file);
    if (path.extname(file) === '.xlsx') {
      const match = file.match(/^(.*?) - (.*?) -/);
      if (match) {
        const state = match[1];
        const thematicArea = match[2];

        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[sheetName];

        const idPlanGenerate = uuidv4();

        const resultEntry = {
          "planId": idPlanGenerate,
          "year": sheet['M1'] ? sheet['M1'].v : null,
          "state": state,
          "thematicArea": thematicArea,
          "diagnosis": sheet['B19'] ? sheet['B19'].v : null,
          "justification": sheet['B20'] ? sheet['B20'].v : null,
          "generalGoal": sheet['B21'] ? sheet['B21'].v : null,
          "implementationStrategy": sheet['B23'] ? sheet['B23'].v : null,
          "diagnosticImplementationStrategy": sheet['B25'] ? sheet['B25'].v : null,
          "governanceImplementationStrategy": sheet['B27'] ? sheet['B27'].v : null,
          "capacityImplementationStrategy": sheet['B29'] ? sheet['B29'].v : null,
          "acquisitionImplementationStrategy": sheet['B31'] ? sheet['B31'].v : null,
          "resultIndicator": sheet['B32'] ? sheet['B32'].v : null,
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
              financedItem: sheet[startingCells["financedItem"] + rowIndex] ? sheet[startingCells["financedItem"] + rowIndex].v : null,
              itemDescription: sheet[startingCells["itemDescription"] + rowIndex] ? sheet[startingCells["itemDescription"] + rowIndex].v : null,
              senaspItemCode: sheet[startingCells["senaspItemCode"] + rowIndex] ? sheet[startingCells["senaspItemCode"] + rowIndex].v : null,
              institution: sheet[startingCells["institution"] + rowIndex] ? sheet[startingCells["institution"] + rowIndex].v : null,
              expenseType: sheet[startingCells["expenseType"] + rowIndex] ? sheet[startingCells["expenseType"] + rowIndex].v : null,
              plannedQuantity: sheet[startingCells["plannedQuantity"] + rowIndex] ? sheet[startingCells["plannedQuantity"] + rowIndex].v : null,
              measurementUnit: sheet[startingCells["measurementUnit"] + rowIndex] ? sheet[startingCells["measurementUnit"] + rowIndex].v : null,
              plannedValue: sheet[startingCells["plannedValue"] + rowIndex] ? sheet[startingCells["plannedValue"] + rowIndex].v : null,
              processIndicatorDescription: sheet[startingCells["processIndicatorDescription"] + rowIndex] ? sheet[startingCells["processIndicatorDescription"] + rowIndex].v : null,
              processIndicatorFormula: sheet[startingCells["processIndicatorFormula"] + rowIndex] ? sheet[startingCells["processIndicatorFormula"] + rowIndex].v : null,
              periodicity: sheet[startingCells["periodicity"] + rowIndex] ? sheet[startingCells["periodicity"] + rowIndex].v : null,
              pmspGoal: sheet[startingCells["pmspGoal"] + rowIndex] ? sheet[startingCells["pmspGoal"] + rowIndex].v : null,
              pespGoal: sheet[startingCells["pespGoal"] + rowIndex] ? sheet[startingCells["pespGoal"] + rowIndex].v : null,
            };
            for (let key in itemData) {
              itemData[key] = typeof itemData[key] === "string" ? itemData[key].replace(/\s+/g, ' ').trim() : itemData[key];
            }
            actionObj["items"].push(itemData);
          }
        }
      } else {
        console.error('Nome de arquivo não corresponde ao padrão esperado:', file);
      }
    }
  });

  fs.writeFile('database/data.json', JSON.stringify(allResults, null, 2), (err) => {
    if (err) throw err;
    console.log('Os dados foram salvos em database/data.json.');
  });
});
