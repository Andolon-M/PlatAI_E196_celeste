import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando sembrado de la base de datos...');

  // ==========================================
  // 1. Crear Suscripciones (Planes)
  // ==========================================
  console.log('Creando planes de suscripción...');
  const subGratuito = await prisma.subscriptions.upsert({
    where: { name: 'Gratuito' },
    update: {},
    create: {
      name: 'Gratuito',
      price: 0.00
    }
  });

  const subPremium = await prisma.subscriptions.upsert({
    where: { name: 'Premium' },
    update: {},
    create: {
      name: 'Premium',
      price: 19900.00
    }
  });

  const subAdmin = await prisma.subscriptions.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      price: 0.00
    }
  });

  console.log(`Planes creados: Gratuito (ID: ${subGratuito.id}), Premium (ID: ${subPremium.id}), Admin (ID: ${subAdmin.id})`);

  // ==========================================
  // 2. Crear Capacidades (Permisos)
  // ==========================================
  console.log('Creando capacidades del sistema...');
  const resources = [
    'cuentas',
    'movimientos',
    'metas_ahorro',
    'deudas_prestamos',
    'transferencias',
    'notificaciones',
    'user_external_chats',
    'users'
  ];
  
  const actions = ['create', 'read', 'update', 'delete'];
  const capabilitiesList: { resource: string; action: string; type: number; description: string }[] = [];

  for (const resource of resources) {
    for (const action of actions) {
      let description = `Permite realizar la acción de ${action} en el recurso ${resource}`;
      if (resource === 'users' && action === 'read') {
        description = 'Permite ver estadísticas y listados de usuarios del sistema';
      }
      capabilitiesList.push({
        resource,
        action,
        type: 0,
        description
      });
    }
  }

  // Insertar cada capacidad y guardarla para mapear
  const createdCapabilities = [];
  for (const cap of capabilitiesList) {
    const createdCap = await prisma.capabilities.upsert({
      where: {
        capabilities_resource_action_unique: {
          resource: cap.resource,
          action: cap.action,
          type: cap.type
        }
      },
      update: {
        description: cap.description
      },
      create: cap
    });
    createdCapabilities.push(createdCap);
  }
  console.log(`Se crearon/actualizaron ${createdCapabilities.length} capacidades.`);

  // ==========================================
  // 3. Vincular Suscripciones y Capacidades
  // ==========================================
  console.log('Asignando capacidades a los planes de suscripción...');

  // Limpiar asignaciones previas para evitar duplicados
  await prisma.subscription_capabilities.deleteMany({});

  // Reglas de asignación:
  // - Admin: Tiene todas las capacidades de todos los recursos.
  // - Gratuito y Premium: Tienen capacidades de todos los recursos FINANCIEROS (todos menos 'users').
  for (const cap of createdCapabilities) {
    // Todos los planes reciben capacidades financieras
    if (cap.resource !== 'users') {
      // Asignar a Gratuito
      await prisma.subscription_capabilities.create({
        data: {
          subscription_id: subGratuito.id,
          capability_id: cap.id
        }
      });
      // Asignar a Premium
      await prisma.subscription_capabilities.create({
        data: {
          subscription_id: subPremium.id,
          capability_id: cap.id
        }
      });
    }

    // El plan Admin recibe absolutamente todas las capacidades (incluyendo 'users')
    await prisma.subscription_capabilities.create({
      data: {
        subscription_id: subAdmin.id,
        capability_id: cap.id
      }
    });
  }
  console.log('Capacidades asignadas con éxito.');

  // ==========================================
  // 4. Crear Usuario Administrador Inicial
  // ==========================================
  console.log('Creando usuario administrador inicial...');
  const adminEmail = 'admin@finapp.com';
  const hashedPassword = bcrypt.hashSync('AdminFinApp2026!', 10);

  const adminUser = await prisma.users.upsert({
    where: { email: adminEmail },
    update: {
      password_hash: hashedPassword,
      subscription_id: subAdmin.id,
      estado: 1,
      email_verificado: 1
    },
    create: {
      nombre: 'System Administrator',
      email: adminEmail,
      password_hash: hashedPassword,
      moneda_preferida: 'COP',
      estado: 1,
      email_verificado: 1,
      subscription_id: subAdmin.id
    }
  });

  console.log(`🚀 Usuario administrador creado con éxito:`);
  console.log(`   - Email: ${adminUser.email}`);
  console.log(`   - Contraseña: AdminFinApp2026!`);
  console.log(`   - Suscripción: Admin (ID: ${adminUser.subscription_id})`);
  
  console.log('\n🌱 Proceso de sembrado completado con éxito.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el sembrado de base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
