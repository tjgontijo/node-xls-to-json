const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const directoryPath = './assets/planilhas';

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
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets['Plano'];
      const output = [];

      for (let rowIndex = 55; rowIndex <= 1000; rowIndex++) {
        if (isRowEmpty(sheet, rowIndex)) continue;

        const itemData = {};

        for (const key in startingCells) {
          const address = startingCells[key] + rowIndex;
          const cell = sheet[address];
          if (cell) {
            itemData[key] = typeof cell.v === "string" ? cell.v.replace(/\s+/g, ' ').trim() : cell.v;
          }
        }

        const currentMetaNum = sheet[startingCells["metaNum"] + rowIndex].v;
        const currentActionNum = sheet[startingCells["actionNum"] + rowIndex].v;
        let metaObj = output.find(meta => meta["metaNum"] === currentMetaNum);

        // Se não encontrar a meta, cria uma nova
        if (!metaObj) {
          metaObj = {
            "metaNum": currentMetaNum,
            "actions": []
          };
          output.push(metaObj);
        }

        let actionObj = metaObj["actions"].find(action => action["actionNum"] === currentActionNum);
        if (!actionObj) {
          actionObj = {
            "actionNum": currentActionNum,
            "items": []
          };
          metaObj["actions"].push(actionObj);
        }

        delete itemData["metaNum"];  // Removemos o "metaNum" do objeto de item
        delete itemData["actionNum"];  // Removemos o "actionNum" do objeto de item
        actionObj["items"].push(itemData);
      }

      fs.writeFile(`${file.split('.')[0]}.json`, JSON.stringify(output, null, 2), (err) => {
        if (err) throw err;
        console.log(`Os dados foram salvos em ${file.split('.')[0]}.json.`);
      });
    }
  });
});