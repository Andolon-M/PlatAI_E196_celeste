/**
 * @swagger
 * components:
 *   schemas:
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
 * tags:
 *   - name: Categorias
 *     description: Operaciones sobre Categorías de Ingresos y Gastos
 *
 * paths:
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
 *   /categories/{id}:
 *     get:
 *       summary: Obtener categoría por ID
 *       tags: [Categorias]
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
 *           description: Categoría obtenida correctamente
 *         404:
 *           description: Categoría no encontrada
 *
 *     put:
 *       summary: Actualizar categoría personalizada
 *       tags: [Categorias]
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
 *                   enum: [ingreso, gasto, ambos]
 *                 icono:
 *                   type: string
 *                 color:
 *                   type: string
 *                 estado:
 *                   type: integer
 *                   enum: [0, 1]
 *       responses:
 *         200:
 *           description: Categoría actualizada exitosamente
 *         403:
 *           description: Intento de modificar una categoría global del sistema
 *
 *     delete:
 *       summary: Eliminar lógicamente una categoría personalizada
 *       tags: [Categorias]
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
 *           description: Categoría eliminada exitosamente
 *         403:
 *           description: Intento de eliminar una categoría global del sistema
 */

export {};
