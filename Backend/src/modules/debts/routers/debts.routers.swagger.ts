/**
 * @swagger
 * components:
 *   schemas:
 *     DeudaPrestamo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la deuda o préstamo
 *           example: "1"
 *         tipo:
 *           type: string
 *           enum: [yo_debo, me_deben]
 *           description: Tipo de deuda
 *           example: "yo_debo"
 *         persona_entidad:
 *           type: string
 *           description: Persona o entidad involucrada
 *           example: "Banco Nacional"
 *         monto_total:
 *           type: string
 *           description: Monto total de la deuda
 *           example: "5000000.00"
 *         monto_pendiente:
 *           type: string
 *           description: Monto pendiente calculado (monto_total - total abonado)
 *           example: "3500000.00"
 *         total_abonado:
 *           type: string
 *           description: Total abonado calculado desde los registros de abonos
 *           example: "1500000.00"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Préstamo para remodelación"
 *         fecha_vencimiento:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2027-06-30"
 *         estado:
 *           type: string
 *           enum: [pendiente, parcial, pagada, cancelada]
 *           example: "parcial"
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *         fecha_modificacion:
 *           type: string
 *           format: date-time
 *         abonos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AbonoDeuda'
 *
 *     AbonoDeuda:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del abono
 *           example: "1"
 *         id_deuda:
 *           type: string
 *           description: ID de la deuda asociada
 *           example: "1"
 *         monto_abonado:
 *           type: string
 *           description: Monto abonado
 *           example: "500000.00"
 *         nota:
 *           type: string
 *           nullable: true
 *           example: "Pago mensual de junio"
 *         fecha_abono:
 *           type: string
 *           format: date
 *           example: "2026-06-12"
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *
 * tags:
 *   - name: Deudas y Préstamos
 *     description: Operaciones sobre Deudas, Préstamos y Abonos asociados
 *
 * paths:
 *   /debts:
 *     get:
 *       summary: Obtener todas las deudas y préstamos del usuario
 *       tags: [Deudas y Préstamos]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: tipo
 *           schema:
 *             type: string
 *             enum: [yo_debo, me_deben]
 *           description: Filtrar por tipo de deuda
 *         - in: query
 *           name: estado
 *           schema:
 *             type: string
 *             enum: [pendiente, parcial, pagada, cancelada]
 *           description: Filtrar por estado de la deuda
 *       responses:
 *         200:
 *           description: Deudas y préstamos obtenidos correctamente
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: integer
 *                     example: 200
 *                   data:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/DeudaPrestamo'
 *
 *     post:
 *       summary: Crear una nueva deuda o préstamo
 *       tags: [Deudas y Préstamos]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - tipo
 *                 - persona_entidad
 *                 - monto_total
 *               properties:
 *                 tipo:
 *                   type: string
 *                   enum: [yo_debo, me_deben]
 *                   example: "yo_debo"
 *                 persona_entidad:
 *                   type: string
 *                   example: "Juan Pérez"
 *                 monto_total:
 *                   type: number
 *                   example: 2000000
 *                 descripcion:
 *                   type: string
 *                   example: "Préstamo personal para emergencia"
 *                 fecha_vencimiento:
 *                   type: string
 *                   format: date
 *                   example: "2027-01-15"
 *       responses:
 *         201:
 *           description: Deuda o préstamo creado exitosamente
 *         400:
 *           description: Error en los datos enviados
 *
 *   /debts/{id}:
 *     get:
 *       summary: Obtener deuda o préstamo por ID (con sus abonos)
 *       tags: [Deudas y Préstamos]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Deuda o préstamo obtenido correctamente
 *         404:
 *           description: Deuda o préstamo no encontrado
 *
 *     put:
 *       summary: Actualizar deuda o préstamo
 *       tags: [Deudas y Préstamos]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: string
 *                   enum: [yo_debo, me_deben]
 *                 persona_entidad:
 *                   type: string
 *                 monto_total:
 *                   type: number
 *                 descripcion:
 *                   type: string
 *                 fecha_vencimiento:
 *                   type: string
 *                   format: date
 *                 estado:
 *                   type: string
 *                   enum: [pendiente, parcial, pagada, cancelada]
 *       responses:
 *         200:
 *           description: Deuda o préstamo actualizado exitosamente
 *         404:
 *           description: Deuda o préstamo no encontrado
 *
 *     delete:
 *       summary: Eliminar una deuda o préstamo (solo si no tiene abonos)
 *       tags: [Deudas y Préstamos]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Deuda o préstamo eliminado exitosamente
 *         409:
 *           description: No se puede eliminar porque tiene abonos registrados
 *
 *   /debts/{id}/payments:
 *     get:
 *       summary: Obtener abonos de una deuda
 *       tags: [Deudas y Préstamos]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Listado de abonos obtenido correctamente
 *
 *     post:
 *       summary: Registrar un abono a una deuda
 *       description: Registra el abono y actualiza automáticamente el estado de la deuda (pendiente → parcial → pagada).
 *       tags: [Deudas y Préstamos]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: ID de la deuda
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - monto_abonado
 *                 - fecha_abono
 *               properties:
 *                 monto_abonado:
 *                   type: number
 *                   description: Monto a abonar
 *                   example: 500000.00
 *                 fecha_abono:
 *                   type: string
 *                   format: date
 *                   example: "2026-06-12"
 *                 nota:
 *                   type: string
 *                   example: "Cuota mensual"
 *       responses:
 *         201:
 *           description: Abono registrado exitosamente
 *         400:
 *           description: Monto excede el pendiente o deuda inválida
 *
 *   /debts/payments/{paymentId}:
 *     delete:
 *       summary: Eliminar/Revertir un abono realizado
 *       description: Elimina el abono y recalcula automáticamente el estado de la deuda.
 *       tags: [Deudas y Préstamos]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: paymentId
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Abono eliminado y estado de la deuda recalculado
 */

export {};
