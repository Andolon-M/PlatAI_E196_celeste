/*
  Warnings:

  - You are about to alter the column `fecha_expiracion` on the `sesiones` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `token_expiracion` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[celular]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `sesiones` MODIFY `fecha_expiracion` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `celular` VARCHAR(50) NULL,
    MODIFY `token_expiracion` DATETIME NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_celular_key` ON `users`(`celular`);
