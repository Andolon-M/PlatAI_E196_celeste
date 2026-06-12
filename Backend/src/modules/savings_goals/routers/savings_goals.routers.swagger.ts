/**
 * @swagger
 * components:
 *   schemas:
 *     MetaAhorro:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la meta de ahorro
 *           example: "1"
 *         nombre:
 *           type: string
 *           description: Nombre de la meta
 *           example: "Vacaciones en la playa"
 *         monto_objetivo:
 *           type: string
 *           description: Monto total objetivo a ahorrar
 *           example: "5000000.00"
 *         monto_actual:
 *           type: string
 *           description: Monto acumulado actual
 *           example: "1500000.00"
 *         fecha_limite:
 *           type: string
 *           format: date
 *           example: "2026-12-31"
 *         prioridad:
 *           type: string
 *           enum: [alta, media, baja]
 *           example: "alta"
 *         estado:
 *           type: string
 *           enum: [activa, pausada, completada, cancelada]
 *           example: "activa"
 *         icono:
 *           type: string
 *           nullable: true
 *           example: "airplane"
 *         color:
 *           type: string
 *           nullable: true
 *           example: "#3498db"
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *         fecha_modificacion:
 *           type: string
 *           format: date-time
 *
 *     AporteMeta:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del aporte
 *           example: "1"
 *         id_meta:
 *           type: string
 *           description: ID de la meta asociada
 *           example: "1"
 *         id_cuenta:
 *           type: string
 *           description: ID de la cuenta origen de donde se debitó
 *           example: "2"
 *         monto:
 *           type: string
 *           description: Monto aportado
 *           example: "250000.00"
 *         nota:
 *           type: string
 *           nullable: true
 *           example: "Ahorro quincenal"
 *         fecha_aporte:
 *           type: string
 *           format: date
 *           example: "2026-06-12"
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *
 * tags:
 *   - name: Metas Ahorro
 *     description: Operaciones sobre Metas de Ahorro y Aportes asociados
 *
 * paths:
 *   /savings-goals:
 *     get:
 *       summary: Obtener todas las metas de ahorro del usuario
 *       tags: [Metas Ahorro]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: estado
 *           schema:
 *             type: string
 *             enum: [activa, pausada, completada, cancelada]
 *           description: Filtrar por estado de la meta
 *       responses:
 *         200:
 *           description: Metas de ahorro obtenidas correctamente
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
 *                       $ref: '#/components/schemas/MetaAhorro'
 *
 *     post:
 *       summary: Crear una nueva meta de ahorro
 *       tags: [Metas Ahorro]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - nombre
 *                 - monto_objetivo
 *                 - fecha_limite
 *                 - prioridad
 *               properties:
 *                 nombre:
 *                   type: string
 *                   example: "Comprar Computadora"
 *                 monto_objetivo:
 *                   type: number
 *                   example: 1200000
 *                 fecha_limite:
 *                   type: string
 *                   format: date
 *                   example: "2026-09-30"
 *                 prioridad:
 *                   type: string
 *                   enum: [alta, media, baja]
 *                   example: "media"
 *                 icono:
 *                   type: string
 *                   example: "laptop"
 *                 color:
 *                   type: string
 *                   example: "#2ecc71"
 *       responses:
 *         201:
 *           description: Meta de ahorro creada correctamente
 *
 *   /savings-goals/{id}:
 *     get:
 *       summary: Obtener meta de ahorro por ID (con sus aportes)
 *       tags: [Metas Ahorro]
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
 *           description: Meta de ahorro obtenida correctamente
 *         404:
 *           description: Meta de ahorro no encontrada
 *
 *     put:
 *       summary: Actualizar meta de ahorro
 *       tags: [Metas Ahorro]
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
 *                 nombre:
 *                   type: string
 *                 monto_objetivo:
 *                   type: number
 *                 fecha_limite:
 *                   type: string
 *                   format: date
 *                 prioridad:
 *                   type: string
 *                   enum: [alta, media, baja]
 *                 estado:
 *                   type: string
 *                   enum: [activa, pausada, completada, cancelada]
 *                 icono:
 *                   type: string
 *                 color:
 *                   type: string
 *       responses:
 *         200:
 *           description: Meta de ahorro actualizada
 *         404:
 *           description: Meta de ahorro no encontrada
 *
 *     delete:
 *       summary: Eliminar una meta de ahorro (y sus aportes asociados)
 *       tags: [Metas Ahorro]
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
 *           description: Meta de ahorro eliminada exitosamente
 *
 *   /savings-goals/{id}/contributions:
 *     get:
 *       summary: Obtener aportes de una meta de ahorro
 *       tags: [Metas Ahorro]
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
 *           description: Listado de aportes obtenido correctamente
 *
 *     post:
 *       summary: Registrar un aporte a una meta de ahorro (debitando de una cuenta)
 *       description: Registra el aporte, restando el monto del saldo de la cuenta indicada e incrementando la meta acumulada.
 *       tags: [Metas Ahorro]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: ID de la meta de ahorro
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - id_cuenta
 *                 - monto
 *                 - fecha_aporte
 *               properties:
 *                 id_cuenta:
 *                   type: string
 *                   description: ID de la cuenta origen
 *                   example: "1"
 *                 monto:
 *                   type: number
 *                   description: Monto a ahorrar/aportar
 *                   example: 150000.00
 *                 fecha_aporte:
 *                   type: string
 *                   format: date
 *                   example: "2026-06-12"
 *                 nota:
 *                   type: string
 *                   example: "Reserva del sueldo"
 *       responses:
 *         201:
 *           description: Aporte registrado exitosamente
 *         400:
 *           description: Saldo insuficiente o cuentas inválidas
 *
 *   /savings-goals/contributions/{contributionId}:
 *     delete:
 *       summary: Eliminar/Revertir un aporte realizado
 *       description: Revierte la transacción devolviendo el saldo a la cuenta de origen y restando el acumulado de la meta.
 *       tags: [Metas Ahorro]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: contributionId
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Aporte eliminado y saldo restaurado correctamente
 */

export {};
