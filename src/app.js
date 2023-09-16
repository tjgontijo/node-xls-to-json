const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const directoryPath = './assets/planilhas';
const allResults = {};
const sheetName = 'Plano';

fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.error('Erro ao ler o diretório:', err);
  }

  files.forEach(function (file) {
    const filePath = path.join(directoryPath, file);

    if (path.extname(file) === '.xlsx') {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[sheetName];

      const generalInfo = {
        "Ano": sheet['M1'] ? sheet['M1'].v : null,
        "Estado": sheet['N1'] ? sheet['N1'].v : null,
        "Área Temática": sheet['A2'] ? sheet['A2'].v : null,
        "Diagnóstico": sheet['B19'] ? sheet['B19'].v : null
      };


      const specificGoals = [];
      const mergedCellRange = 'B33:D50';
      const { s, e } = XLSX.utils.decode_range(mergedCellRange);

      let currentNumber = null;
      for (let rowIndex = s.r; rowIndex <= e.r; rowIndex++) {
        for (let colIndex = s.c; colIndex <= e.c; colIndex++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
          const cell = sheet[cellAddress];

          if (colIndex === s.c) {
            currentNumber = cell ? cell.v : null;
          } else if (cell && cell.v !== undefined && currentNumber !== null) {
            const entry = {
              short_name: currentNumber,
              name: cell.v
            };
            specificGoals.push(entry);
          }
        }
      }

      allResults[file] = {
        "Informações Gerais": generalInfo,
        "Metas Especificas": specificGoals
      };
    }
  });

  const jsonResult = JSON.stringify(allResults, null, 2); // Indentation added for readability
  fs.writeFile('output.json', jsonResult, (err) => {
    if (err) throw err;
    console.log('Os dados foram salvos em output.json.');
  });
});
