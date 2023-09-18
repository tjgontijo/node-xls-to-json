import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

const directoryPath = './assets/planilhas';
const allResults = [];
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

      const idPlanGenerate = uuidv4();

      const resultEntry = {
        "planId": idPlanGenerate,
        "Ano": sheet['M1'] ? sheet['M1'].v : null,
        "Estado": sheet['N1'] ? sheet['N1'].v : null,
        "Área Temática": sheet['A2'] ? sheet['A2'].v : null,
        "Diagnóstico": sheet['B19'] ? sheet['B19'].v : null,
        "Justificativa": sheet['B20'] ? sheet['B20'].v : null,
        "Meta Geral": sheet['B21'] ? sheet['B21'].v : null,
        "Estrategia de Implementação": sheet['B23'] ? sheet['B23'].v : null,
        "Estrategia de Implementação - Diagnóstico Detalhado": sheet['B25'] ? sheet['B25'].v : null,
        "Estrategia de Implementação - Governança": sheet['B27'] ? sheet['B27'].v : null,
        "Estrategia de Implementação - Desenvolvimento de Capacidade Institucional": sheet['B29'] ? sheet['B29'].v : null,
        "Estrategia de Implementação - Aquisição": sheet['B31'] ? sheet['B31'].v : null,
        "Metas Especificas": []
      };

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
              goalId: uuidv4(),
              planId: idPlanGenerate,
              short_name: currentNumber,
              name: cell.v
            };
            resultEntry["Metas Especificas"].push(entry);
          }
        }
      }

      allResults.push(resultEntry);
    }
  });

  const jsonResult = JSON.stringify(allResults, null, 2); // Indentation added for readability
  fs.writeFile('output.json', jsonResult, (err) => {
    if (err) throw err;
    console.log('Os dados foram salvos em output.json.');
  });

});
