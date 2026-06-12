/**
 * @swagger
 * components:
 *   schemas:
 *     Cuenta:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la cuenta
 *           example: "1"
 *         nombre:
 *           type: string
 *           description: Nombre de la cuenta
 *           example: "Mi Cuenta de Ahorros"
 *         tipo:
 *           type: string
 *           enum: [Efectivo, Digital, Banco, Otro]
 *           description: Tipo de cuenta
 *           example: "Banco"
 *         saldo:
 *           type: string
 *           description: Saldo actual de la cuenta
 *           example: "1250000.50"
 *         color:
 *           type: string
 *           description: Color identificador (hexadecimal o nombre)
 *           example: "#3498db"
 *         estado:
 *           type: integer
 *           description: Estado de la cuenta (1 = activa, 0 = archivada)
 *           example: 1
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *         fecha_modificacion:
 *           type: string
 *           format: date-time
 *
 * tags:
 *   - name: Cuentas
 *     description: Operaciones sobre Cuentas Financieras del usuario
 *
 * paths:
 *   /accounts:
 *     get:
 *       summary: Obtener todas las cuentas del usuario
 *       tags: [Cuentas]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: estado
 *           schema:
 *             type: integer
 *             enum: [0, 1]
 *           description: Filtrar por 1 (activas) o 0 (archivadas)
 *       responses:
 *         200:
 *           description: Cuentas obtenidas correctamente
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
 *                       $ref: '#/components/schemas/Cuenta'
 *
 *     post:
 *       summary: Crear una nueva cuenta financiera
 *       description: Permite crear una cuenta (Límite de 3 para planes Gratuitos)
 *       tags: [Cuentas]
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
 *                 - tipo
 *               properties:
 *                 nombre:
 *                   type: string
 *                   example: "Mi Billetera Digital"
 *                 tipo:
 *                   type: string
 *                   enum: [Efectivo, Digital, Banco, Otro]
 *                   example: "Digital"
 *                 saldo:
 *                   type: number
 *                   example: 150000.00
 *                 color:
 *                   type: string
 *                   example: "#2ecc71"
 *       responses:
 *         201:
 *           description: Cuenta creada correctamente
 *         403:
 *           description: Límite de cuentas excedido para el plan gratuito
 *
 *   /accounts/{id}:
 *     get:
 *       summary: Obtener cuenta por ID
 *       tags: [Cuentas]
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
 *           description: Cuenta obtenida correctamente
 *         404:
 *           description: Cuenta no encontrada
 *
 *     put:
 *       summary: Actualizar cuenta
 *       tags: [Cuentas]
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
 *                 tipo:
 *                   type: string
 *                   enum: [Efectivo, Digital, Banco, Otro]
 *                 color:
 *                   type: string
 *                 estado:
 *                   type: integer
 *                   enum: [0, 1]
 *       responses:
 *         200:
 *           description: Cuenta actualizada
 *
 *     delete:
 *       summary: Archivar/Eliminar cuenta
 *       tags: [Cuentas]
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
 *           description: Cuenta archivada exitosamente
 *
 *   /accounts/transfer:
 *     post:
 *       summary: Registrar una transferencia entre cuentas del usuario
 *       description: Registra la transferencia, descontando de la cuenta de origen e incrementando en la cuenta de destino (ambas deben pertenecer al usuario)
 *       tags: [Cuentas]
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
 *         400:
 *           description: Datos inválidos o cuentas no pertenecen al usuario
 */

export {};
