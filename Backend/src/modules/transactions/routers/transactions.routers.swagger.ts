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
 *     Categoria:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la categoría
 *           example: "1"
 *         id_usuario:
 *           type: string
 *           nullable: true
 *           description: ID del creador (null si es categoría del sistema/defecto)
 *           example: null
 *         nombre:
 *           type: string
 *           description: Nombre de la categoría
 *           example: "Alimentación"
 *         tipo:
 *           type: string
 *           enum: [ingreso, gasto, ambos]
 *           description: Tipo de movimientos compatibles
 *           example: "gasto"
 *         icono:
 *           type: string
 *           description: Identificador del icono de la categoría
 *           example: "fast-food"
 *         color:
 *           type: string
 *           description: Color identificador de la categoría
 *           example: "#e74c3c"
 *         estado:
 *           type: integer
 *           description: Estado (1 = activa, 0 = inactiva)
 *           example: 1
 *
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
 *   - name: Cuentas
 *     description: Operaciones sobre Cuentas Financieras del usuario
 *   - name: Categorias
 *     description: Operaciones sobre Categorías de Ingresos y Gastos
 *   - name: Movimientos
 *     description: Operaciones sobre Ingresos, Gastos y Transferencias
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
 *   /categories:
 *     get:
 *       summary: Obtener categorías disponibles
 *       description: Obtiene las categorías globales y personalizadas activas del usuario
 *       tags: [Categorias]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: tipo
 *           schema:
 *             type: string
 *             enum: [ingreso, gasto, ambos]
 *       responses:
 *         200:
 *           description: Categorías obtenidas correctamente
 *
 *     post:
 *       summary: Crear una categoría personalizada
 *       tags: [Categorias]
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
 *                   example: "Gimnasio"
 *                 tipo:
 *                   type: string
 *                   enum: [ingreso, gasto, ambos]
 *                   example: "gasto"
 *                 icono:
 *                   type: string
 *                   example: "barbell"
 *                 color:
 *                   type: string
 *                   example: "#9b59b6"
 *       responses:
 *         201:
 *           description: Categoría creada exitosamente
 *
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
