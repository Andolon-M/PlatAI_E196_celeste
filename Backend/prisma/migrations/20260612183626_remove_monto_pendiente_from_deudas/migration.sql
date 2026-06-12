/*
  Warnings:

  - You are about to drop the column `monto_pendiente` on the `deudas_prestamos` table. All the data in the column will be lost.
  - You are about to alter the column `fecha_expiracion` on the `sesiones` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `token_expiracion` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `deudas_prestamos` DROP COLUMN `monto_pendiente`;

-- AlterTable
ALTER TABLE `sesiones` MODIFY `fecha_expiracion` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `token_expiracion` DATETIME NULL;
