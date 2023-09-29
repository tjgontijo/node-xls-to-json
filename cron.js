import cron from 'node-cron';
import { exec } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, 'log', 'cron.txt');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFilePath, `${timestamp} - ${message}\n`, 'utf8');
}

function runScripts() {
  logToFile('Rodando scripts');
  exec('node src/delete-db.js', (error, stdout, stderr) => {
    if (error) {
      logToFile(`Erro ao executar delete-db.js: ${error}`);
      return;
    }
    logToFile(`delete-db.js stdout: ${stdout}`);
    logToFile(`delete-db.js stderr: ${stderr}`);
    exec('node src/all.js', (error, stdout, stderr) => {
      if (error) {
        logToFile(`Erro ao executar all.js: ${error}`);
        return;
      }
      logToFile(`all.js stdout: ${stdout}`);
      logToFile(`all.js stderr: ${stderr}`);
      exec('node src/insert-db.js', (error, stdout, stderr) => {
        if (error) {
          logToFile(`Erro ao executar insert-db.js: ${error}`);
          return;
        }
        logToFile(`insert-db.js stdout: ${stdout}`);
        logToFile(`insert-db.js stderr: ${stderr}`);
      });
    });
  });
}

runScripts();
cron.schedule('0 */2 * * *', runScripts);
