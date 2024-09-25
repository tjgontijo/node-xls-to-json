import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
function extractInfoFromFilename(filename) {
  const match = filename.match(/^(.+?) - (.+?) - Plano de Ação (\d+).xlsx$/);
    if (match) {
        return {
            state: match[1],
          thematicArea: match[2],
          year: parseInt(match[3], 10)
        };
    }
    return null;
}

async function readDirRecursively(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      return readDirRecursively(res);
    } else if (path.extname(res) === '.xlsx') {
      const info = extractInfoFromFilename(path.basename(res));
      const idUpdatePlan = uuidv4();
      if (info) {
        return fs.promises.stat(res).then(stats => ({
          
          ...info,
          itemId: idUpdatePlan,
          last_update: stats.mtime
        }));
       }    
    }

    return null;
  }));

  return files.reduce((acc, file) => file ? acc.concat(file) : acc, []);
}

async function insertIntoDatabase(files) {
  for (const file of files) {
    await prisma.updatePlan.create({
      data: file
    });
  }
}

readDirRecursively('C:/Users/thiago.gontijo/OneDrive - MINISTERIO DA JUSTIÇA/DSUSP/Planilhas')
  .then(files => insertIntoDatabase(files))
  .catch(err => {
    console.error('Erro:', err);
  })
  .finally(() => {
    prisma.$disconnect();
  });
