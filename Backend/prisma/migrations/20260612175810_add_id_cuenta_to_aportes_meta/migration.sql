/*
  Warnings:

  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to drop the `password_reset_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_has_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_profiles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombre` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `password_reset_tokens` DROP FOREIGN KEY `password_reset_tokens_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `role_has_permissions` DROP FOREIGN KEY `role_has_permissions_permission_id_foreign`;

-- DropForeignKey
ALTER TABLE `role_has_permissions` DROP FOREIGN KEY `role_has_permissions_role_id_foreign`;

-- DropForeignKey
ALTER TABLE `user_profiles` DROP FOREIGN KEY `user_profiles_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_role_id_fkey`;

-- DropIndex
DROP INDEX `users_role_id_fkey` ON `users`;

-- AlterTable
ALTER TABLE `user_oauth_tokens` MODIFY `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `users` DROP COLUMN `created_at`,
    DROP COLUMN `deleted_at`,
    DROP COLUMN `email_verified_at`,
    DROP COLUMN `image`,
    DROP COLUMN `password`,
    DROP COLUMN `role_id`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `email_verificado` TINYINT NOT NULL DEFAULT 0,
    ADD COLUMN `estado` TINYINT NOT NULL DEFAULT 1,
    ADD COLUMN `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `fecha_modificacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `foto_perfil` VARCHAR(255) NULL,
    ADD COLUMN `moneda_preferida` VARCHAR(10) NOT NULL DEFAULT 'COP',
    ADD COLUMN `nombre` VARCHAR(150) NOT NULL,
    ADD COLUMN `password_hash` VARCHAR(255) NULL,
    ADD COLUMN `subscription_id` BIGINT UNSIGNED NULL,
    ADD COLUMN `token_expiracion` DATETIME NULL,
    ADD COLUMN `token_recuperacion` VARCHAR(255) NULL,
    MODIFY `email` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `password_reset_tokens`;

-- DropTable
DROP TABLE `permissions`;

-- DropTable
DROP TABLE `role_has_permissions`;

-- DropTable
DROP TABLE `roles`;

-- DropTable
DROP TABLE `user_profiles`;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `subscriptions_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `capabilities` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `resource` VARCHAR(255) NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `type` INTEGER NOT NULL DEFAULT 0,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `capabilities_resource_action_unique`(`resource`, `action`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_capabilities` (
    `subscription_id` BIGINT UNSIGNED NOT NULL,
    `capability_id` BIGINT UNSIGNED NOT NULL,

    INDEX `subscription_capabilities_subscription_id_idx`(`subscription_id`),
    PRIMARY KEY (`subscription_id`, `capability_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sesiones` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` BIGINT UNSIGNED NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `dispositivo` VARCHAR(255) NULL,
    `ip` VARCHAR(45) NULL,
    `fecha_expiracion` DATETIME NOT NULL,
    `activa` TINYINT NOT NULL DEFAULT 1,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `sesiones_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_external_chats` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `external_chat_user_id` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_external_chats_user_id_key`(`user_id`),
    INDEX `user_external_chats_user_id_idx`(`user_id`),
    INDEX `user_external_chats_telefono_idx`(`telefono`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cuentas` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` BIGINT UNSIGNED NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `tipo` ENUM('Efectivo', 'Digital', 'Banco', 'Otro') NOT NULL,
    `saldo` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `color` VARCHAR(20) NULL,
    `estado` TINYINT NOT NULL DEFAULT 1,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_modificacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `cuentas_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` BIGINT UNSIGNED NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `tipo` ENUM('ingreso', 'gasto', 'ambos') NOT NULL,
    `icono` VARCHAR(50) NULL,
    `color` VARCHAR(20) NULL,
    `estado` TINYINT NOT NULL DEFAULT 1,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_modificacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `categorias_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimientos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` BIGINT UNSIGNED NOT NULL,
    `id_cuenta` BIGINT UNSIGNED NOT NULL,
    `id_categoria` BIGINT UNSIGNED NOT NULL,
    `tipo` ENUM('ingreso', 'gasto') NOT NULL,
    `monto` DECIMAL(15, 2) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `fecha` DATE NOT NULL,
    `metodo_pago` ENUM('Efectivo', 'Transferencia', 'Tarjeta', 'Otro') NOT NULL,
    `nota` TEXT NULL,
    `origen_ia` TINYINT NOT NULL DEFAULT 0,
    `eliminado` TINYINT NOT NULL DEFAULT 0,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_modificacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `movimientos_id_usuario_idx`(`id_usuario`),
    INDEX `movimientos_id_cuenta_idx`(`id_cuenta`),
    INDEX `movimientos_id_categoria_idx`(`id_categoria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metas_ahorro` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` BIGINT UNSIGNED NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `monto_objetivo` DECIMAL(15, 2) NOT NULL,
    `monto_actual` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `fecha_limite` DATE NOT NULL,
    `prioridad` ENUM('alta', 'media', 'baja') NOT NULL,
    `estado` ENUM('activa', 'pausada', 'completada', 'cancelada') NOT NULL,
    `icono` VARCHAR(50) NULL,
    `color` VARCHAR(20) NULL,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_modificacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `metas_ahorro_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aportes_meta` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_meta` BIGINT UNSIGNED NOT NULL,
    `id_usuario` BIGINT UNSIGNED NOT NULL,
    `id_cuenta` BIGINT UNSIGNED NOT NULL,
    `monto` DECIMAL(15, 2) NOT NULL,
    `nota` VARCHAR(255) NULL,
    `fecha_aporte` DATE NOT NULL,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `aportes_meta_id_meta_idx`(`id_meta`),
    INDEX `aportes_meta_id_usuario_idx`(`id_usuario`),
    INDEX `aportes_meta_id_cuenta_idx`(`id_cuenta`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deudas_prestamos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` BIGINT UNSIGNED NOT NULL,
    `tipo` ENUM('yo_debo', 'me_deben') NOT NULL,
    `persona_entidad` VARCHAR(150) NOT NULL,
    `monto_total` DECIMAL(15, 2) NOT NULL,
    `monto_pendiente` DECIMAL(15, 2) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_vencimiento` DATE NULL,
    `estado` ENUM('pendiente', 'parcial', 'pagada', 'cancelada') NOT NULL,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_modificacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `deudas_prestamos_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `abonos_deuda` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_deuda` BIGINT UNSIGNED NOT NULL,
    `id_usuario` BIGINT UNSIGNED NOT NULL,
    `monto_abonado` DECIMAL(15, 2) NOT NULL,
    `nota` VARCHAR(255) NULL,
    `fecha_abono` DATE NOT NULL,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `abonos_deuda_id_deuda_idx`(`id_deuda`),
    INDEX `abonos_deuda_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transferencias` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` BIGINT UNSIGNED NOT NULL,
    `id_cuenta_origen` BIGINT UNSIGNED NOT NULL,
    `id_cuenta_destino` BIGINT UNSIGNED NOT NULL,
    `monto` DECIMAL(15, 2) NOT NULL,
    `nota` VARCHAR(255) NULL,
    `fecha_transferencia` DATE NOT NULL,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `transferencias_id_usuario_idx`(`id_usuario`),
    INDEX `transferencias_id_cuenta_origen_idx`(`id_cuenta_origen`),
    INDEX `transferencias_id_cuenta_destino_idx`(`id_cuenta_destino`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_usuario` BIGINT UNSIGNED NOT NULL,
    `tipo` ENUM('meta_vence', 'deuda_vencida', 'recomendacion', 'sistema') NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `mensaje` TEXT NOT NULL,
    `leida` TINYINT NOT NULL DEFAULT 0,
    `id_referencia` BIGINT UNSIGNED NULL,
    `tabla_referencia` VARCHAR(50) NULL,
    `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `notificaciones_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `users_email_key` ON `users`(`email`);

-- CreateIndex
CREATE INDEX `users_subscription_id_idx` ON `users`(`subscription_id`);

-- AddForeignKey
ALTER TABLE `subscription_capabilities` ADD CONSTRAINT `subscription_capabilities_subscription_id_fkey` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subscription_capabilities` ADD CONSTRAINT `subscription_capabilities_capability_id_fkey` FOREIGN KEY (`capability_id`) REFERENCES `capabilities`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_subscription_id_fkey` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesiones` ADD CONSTRAINT `sesiones_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_external_chats` ADD CONSTRAINT `user_external_chats_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cuentas` ADD CONSTRAINT `cuentas_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categorias` ADD CONSTRAINT `categorias_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos` ADD CONSTRAINT `movimientos_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos` ADD CONSTRAINT `movimientos_id_cuenta_fkey` FOREIGN KEY (`id_cuenta`) REFERENCES `cuentas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos` ADD CONSTRAINT `movimientos_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `metas_ahorro` ADD CONSTRAINT `metas_ahorro_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aportes_meta` ADD CONSTRAINT `aportes_meta_id_meta_fkey` FOREIGN KEY (`id_meta`) REFERENCES `metas_ahorro`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aportes_meta` ADD CONSTRAINT `aportes_meta_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aportes_meta` ADD CONSTRAINT `aportes_meta_id_cuenta_fkey` FOREIGN KEY (`id_cuenta`) REFERENCES `cuentas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deudas_prestamos` ADD CONSTRAINT `deudas_prestamos_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `abonos_deuda` ADD CONSTRAINT `abonos_deuda_id_deuda_fkey` FOREIGN KEY (`id_deuda`) REFERENCES `deudas_prestamos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `abonos_deuda` ADD CONSTRAINT `abonos_deuda_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transferencias` ADD CONSTRAINT `transferencias_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transferencias` ADD CONSTRAINT `transferencias_id_cuenta_origen_fkey` FOREIGN KEY (`id_cuenta_origen`) REFERENCES `cuentas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transferencias` ADD CONSTRAINT `transferencias_id_cuenta_destino_fkey` FOREIGN KEY (`id_cuenta_destino`) REFERENCES `cuentas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
