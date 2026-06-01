import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Iniciando rollback del sembrado de base de datos...');

  // 1. Eliminar usuario administrador inicial
  const adminEmail = 'admin@finapp.com';
  const deletedAdmin = await prisma.users.deleteMany({
    where: { email: adminEmail }
  });
  console.log(`Eliminados ${deletedAdmin.count} usuarios administradores sembrados.`);

  // 2. Eliminar relaciones de capacidades
  const deletedMappings = await prisma.subscription_capabilities.deleteMany({});
  console.log(`Eliminados ${deletedMappings.count} mapeos de suscripción-capacidad.`);

  // 3. Eliminar capacidades
  const deletedCaps = await prisma.capabilities.deleteMany({});
  console.log(`Eliminadas ${deletedCaps.count} capacidades del sistema.`);

  // 4. Eliminar planes de suscripción
  const deletedSubs = await prisma.subscriptions.deleteMany({});
  console.log(`Eliminadas ${deletedSubs.count} suscripciones sembradas.`);

  console.log('\n🧹 Proceso de rollback completado con éxito.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el rollback del sembrado:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
