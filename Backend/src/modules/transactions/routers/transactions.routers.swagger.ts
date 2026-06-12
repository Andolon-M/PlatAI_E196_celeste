/**
 * @swagger
 * components:
 *   schemas:
 *     Movimiento:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID del movimiento
 *           example: "1"
 *         id_cuenta:
 *           type: string
 *           description: ID de la cuenta asociada
 *           example: "1"
 *         id_categoria:
 *           type: string
 *           description: ID de la categoría asociada
 *           example: "1"
 *         tipo:
 *           type: string
 *           enum: [ingreso, gasto]
 *           description: Tipo de movimiento
 *           example: "gasto"
 *         monto:
 *           type: string
 *           description: Monto de la transacción
 *           example: "45000.00"
 *         descripcion:
 *           type: string
 *           description: Breve descripción de la transacción
 *           example: "Compra de supermercado"
 *         fecha:
 *           type: string
 *           format: date
 *           example: "2026-06-01"
 *         metodo_pago:
 *           type: string
 *           enum: [Efectivo, Transferencia, Tarjeta, Otro]
 *           description: Método de pago utilizado
 *           example: "Tarjeta"
 *         nota:
 *           type: string
 *           nullable: true
 *           description: Nota adicional
 *           example: "Comprado en Éxito"
 *         origen_ia:
 *           type: integer
 *           description: Indica si el movimiento fue creado por un chatbot de IA (1 = sí, 0 = no)
 *           example: 0
 *         cuenta:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             nombre:
 *               type: string
 *             tipo:
 *               type: string
 *         categoria:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             nombre:
 *               type: string
 *             icono:
 *               type: string
 *             color:
 *               type: string
 *
 *     Transferencia:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID de la transferencia
 *           example: "1"
 *         id_cuenta_origen:
 *           type: string
 *           description: ID de la cuenta origen
 *           example: "1"
 *         id_cuenta_destino:
 *           type: string
 *           description: ID de la cuenta destino
 *           example: "2"
 *         monto:
 *           type: string
 *           description: Monto transferido
 *           example: "50000.00"
 *         nota:
 *           type: string
 *           nullable: true
 *           example: "Abono a ahorros de viaje"
 *         fecha_transferencia:
 *           type: string
 *           format: date
 *           example: "2026-06-01"
 *         cuenta_origen:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             nombre:
 *               type: string
 *         cuenta_destino:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             nombre:
 *               type: string
 *
 * tags:
 *   - name: Movimientos
 *     description: Operaciones sobre Ingresos, Gastos y Transferencias
 *
 * paths:
 *   /transactions:
 *     get:
 *       summary: Obtener todos los movimientos del usuario con filtros y paginación
 *       tags: [Movimientos]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: id_cuenta
 *           schema:
 *             type: string
 *         - in: query
 *           name: id_categoria
 *           schema:
 *             type: string
 *         - in: query
 *           name: tipo
 *           schema:
 *             type: string
 *             enum: [ingreso, gasto]
 *         - in: query
 *           name: startDate
 *           schema:
 *             type: string
 *             format: date
 *         - in: query
 *           name: endDate
 *           schema:
 *             type: string
 *             format: date
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           description: Búsqueda parcial por descripción o notas
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             default: 1
 *         - in: query
 *           name: pageSize
 *           schema:
 *             type: integer
 *             default: 20
 *       responses:
 *         200:
 *           description: Movimientos obtenidos exitosamente
 *
 *     post:
 *       summary: Registrar un nuevo movimiento (Ingreso o Gasto)
 *       description: Registra el movimiento e impacta atómicamente el saldo de la cuenta indicada
 *       tags: [Movimientos]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - id_cuenta
 *                 - id_categoria
 *                 - tipo
 *                 - monto
 *                 - descripcion
 *                 - fecha
 *                 - metodo_pago
 *               properties:
 *                 id_cuenta:
 *                   type: string
 *                   example: "1"
 *                 id_categoria:
 *                   type: string
 *                   example: "1"
 *                 tipo:
 *                   type: string
 *                   enum: [ingreso, gasto]
 *                   example: "gasto"
 *                 monto:
 *                   type: number
 *                   example: 45000.00
 *                 descripcion:
 *                   type: string
 *                   example: "Cena familiar"
 *                 fecha:
 *                   type: string
 *                   format: date
 *                   example: "2026-06-01"
 *                 metodo_pago:
 *                   type: string
 *                   enum: [Efectivo, Transferencia, Tarjeta, Otro]
 *                   example: "Tarjeta"
 *                 nota:
 *                   type: string
 *                   example: "Restaurante italiano"
 *                 origen_ia:
 *                   type: integer
 *                   enum: [0, 1]
 *                   example: 0
 *       responses:
 *         201:
 *           description: Movimiento registrado exitosamente e impactado el saldo
 *
 *   /transactions/transfer:
 *     post:
 *       summary: Registrar una transferencia entre cuentas propias
 *       description: Registra la transferencia, restando de la cuenta de origen e incrementando en la cuenta de destino
 *       tags: [Movimientos]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - id_cuenta_origen
 *                 - id_cuenta_destino
 *                 - monto
 *                 - fecha_transferencia
 *               properties:
 *                 id_cuenta_origen:
 *                   type: string
 *                   example: "1"
 *                 id_cuenta_destino:
 *                   type: string
 *                   example: "2"
 *                 monto:
 *                   type: number
 *                   example: 30000.00
 *                 fecha_transferencia:
 *                   type: string
 *                   format: date
 *                   example: "2026-06-01"
 *                 nota:
 *                   type: string
 *                   example: "Pasar saldo a gastos diarios"
 *       responses:
 *         201:
 *           description: Transferencia registrada exitosamente
 *
 *   /transactions/transfers:
 *     get:
 *       summary: Obtener listado de transferencias
 *       tags: [Movimientos]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Listado de transferencias obtenido correctamente
 */

export {};
