/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardResumen:
 *       type: object
 *       properties:
 *         total_saldo:
 *           type: string
 *           description: Suma total de saldos de todas las cuentas activas
 *           example: "15250000.00"
 *         total_ingresos:
 *           type: string
 *           description: Total de ingresos en el período
 *           example: "8500000.00"
 *         total_gastos:
 *           type: string
 *           description: Total de gastos en el período
 *           example: "3200000.00"
 *         balance_periodo:
 *           type: string
 *           description: Diferencia entre ingresos y gastos del período
 *           example: "5300000.00"
 *         total_deudas:
 *           type: string
 *           description: Total pendiente de deudas donde yo debo
 *           example: "2000000.00"
 *         total_prestamos:
 *           type: string
 *           description: Total pendiente de préstamos donde me deben
 *           example: "500000.00"
 *
 *     DashboardMovimiento:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "42"
 *         tipo:
 *           type: string
 *           enum: [ingreso, gasto]
 *           example: "gasto"
 *         monto:
 *           type: string
 *           example: "150000.00"
 *         descripcion:
 *           type: string
 *           example: "Supermercado semanal"
 *         fecha:
 *           type: string
 *           format: date
 *           example: "2026-06-10"
 *         metodo_pago:
 *           type: string
 *           example: "Tarjeta"
 *         nota:
 *           type: string
 *           nullable: true
 *         categoria:
 *           type: object
 *           properties:
 *             nombre:
 *               type: string
 *               example: "Alimentación"
 *             color:
 *               type: string
 *               nullable: true
 *               example: "#e74c3c"
 *
 * tags:
 *   - name: Dashboard
 *     description: Resumen financiero general del usuario
 *
 * paths:
 *   /dashboard:
 *     get:
 *       summary: Obtener resumen del dashboard
 *       description: >
 *         Retorna un resumen financiero con totales de saldos, ingresos, gastos, deudas
 *         y préstamos, junto con el historial de movimientos del período.
 *         Si no se envían filtros de fecha, se usa el mes actual por defecto.
 *         Las fechas se normalizan internamente: fecha_inicio a 00:00:00 y fecha_fin a 23:59:59.
 *       tags: [Dashboard]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: fecha_inicio
 *           schema:
 *             type: string
 *             format: date
 *           description: Fecha de inicio del período (ISO 8601). Se normaliza a las 00:00:00.
 *           example: "2026-06-01"
 *         - in: query
 *           name: fecha_fin
 *           schema:
 *             type: string
 *             format: date
 *           description: Fecha de fin del período (ISO 8601). Se normaliza a las 23:59:59.
 *           example: "2026-06-30"
 *       responses:
 *         200:
 *           description: Dashboard obtenido correctamente
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: integer
 *                     example: 200
 *                   message:
 *                     type: string
 *                     example: "Dashboard obtenido correctamente"
 *                   data:
 *                     type: object
 *                     properties:
 *                       resumen:
 *                         $ref: '#/components/schemas/DashboardResumen'
 *                       filtros_aplicados:
 *                         type: object
 *                         properties:
 *                           fecha_inicio:
 *                             type: string
 *                             format: date-time
 *                           fecha_fin:
 *                             type: string
 *                             format: date-time
 *                       historial_movimientos:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/DashboardMovimiento'
 *         401:
 *           description: No autenticado
 *         500:
 *           description: Error interno del servidor
 */

export {};
