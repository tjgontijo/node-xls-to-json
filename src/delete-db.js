import { PrismaClient } from '@prisma/client';

async function resetDatabase() {
  const prisma = new PrismaClient();

  try {
    // Excluir todos os registros em ordem reversa para evitar erros de restrição de chave estrangeira
    await prisma.item.deleteMany({});
    await prisma.action.deleteMany({});
    await prisma.specificGoal.deleteMany({});
    await prisma.plan.deleteMany({});    

    console.log('Banco de dados zerado com sucesso.');
  } catch (error) {
    console.error('Erro ao zerar o banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
