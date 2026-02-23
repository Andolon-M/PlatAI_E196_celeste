import { Request, Response, NextFunction } from 'express';

/**
 * Validador para crear un rol
 */
export const validateCreateRole = (req: Request, res: Response, next: NextFunction) => {
  const { name, guard_name } = req.body;
  const errors: string[] = [];

  // Validar nombre
  if (!name) {
    errors.push('El nombre del rol es requerido');
  } else if (typeof name !== 'string') {
    errors.push('El nombre del rol debe ser una cadena de texto');
  } else if (name.trim().length === 0) {
    errors.push('El nombre del rol no puede estar vacío');
  } else if (name.trim().length > 255) {
    errors.push('El nombre del rol no puede exceder 255 caracteres');
  }

  // Validar guard_name (opcional)
  if (guard_name && typeof guard_name !== 'string') {
    errors.push('El guard_name debe ser una cadena de texto');
  } else if (guard_name && guard_name.trim().length > 255) {
    errors.push('El guard_name no puede exceder 255 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Datos de validación inválidos",
      data: { errors }
    });
  }

  next();
};

/**
 * Validador para actualizar un rol
 */
export const validateUpdateRole = (req: Request, res: Response, next: NextFunction) => {
  const { name, guard_name } = req.body;
  const { id } = req.params;
  const errors: string[] = [];

  // Validar ID
  if (!id) {
    errors.push('El ID del rol es requerido');
  } else if (isNaN(Number(id))) {
    errors.push('El ID del rol debe ser un número válido');
  }

  // Validar nombre
  if (!name) {
    errors.push('El nombre del rol es requerido');
  } else if (typeof name !== 'string') {
    errors.push('El nombre del rol debe ser una cadena de texto');
  } else if (name.trim().length === 0) {
    errors.push('El nombre del rol no puede estar vacío');
  } else if (name.trim().length > 255) {
    errors.push('El nombre del rol no puede exceder 255 caracteres');
  }

  // Validar guard_name (opcional)
  if (guard_name && typeof guard_name !== 'string') {
    errors.push('El guard_name debe ser una cadena de texto');
  } else if (guard_name && guard_name.trim().length > 255) {
    errors.push('El guard_name no puede exceder 255 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Datos de validación inválidos",
      data: { errors }
    });
  }

  next();
};

/**
 * Validador para crear un permiso
 */
export const validateCreatePermission = (req: Request, res: Response, next: NextFunction) => {
  const { name, guard_name } = req.body;
  const errors: string[] = [];

  // Validar nombre
  if (!name) {
    errors.push('El nombre del permiso es requerido');
  } else if (typeof name !== 'string') {
    errors.push('El nombre del permiso debe ser una cadena de texto');
  } else if (name.trim().length === 0) {
    errors.push('El nombre del permiso no puede estar vacío');
  } else if (name.trim().length > 255) {
    errors.push('El nombre del permiso no puede exceder 255 caracteres');
  }

  // Validar guard_name (opcional)
  if (guard_name && typeof guard_name !== 'string') {
    errors.push('El guard_name debe ser una cadena de texto');
  } else if (guard_name && guard_name.trim().length > 255) {
    errors.push('El guard_name no puede exceder 255 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Datos de validación inválidos",
      data: { errors }
    });
  }

  next();
};

/**
 * Validador para actualizar un permiso
 */
export const validateUpdatePermission = (req: Request, res: Response, next: NextFunction) => {
  const { name, guard_name } = req.body;
  const { id } = req.params;
  const errors: string[] = [];

  // Validar ID
  if (!id) {
    errors.push('El ID del permiso es requerido');
  } else if (isNaN(Number(id))) {
    errors.push('El ID del permiso debe ser un número válido');
  }

  // Validar nombre
  if (!name) {
    errors.push('El nombre del permiso es requerido');
  } else if (typeof name !== 'string') {
    errors.push('El nombre del permiso debe ser una cadena de texto');
  } else if (name.trim().length === 0) {
    errors.push('El nombre del permiso no puede estar vacío');
  } else if (name.trim().length > 255) {
    errors.push('El nombre del permiso no puede exceder 255 caracteres');
  }

  // Validar guard_name (opcional)
  if (guard_name && typeof guard_name !== 'string') {
    errors.push('El guard_name debe ser una cadena de texto');
  } else if (guard_name && guard_name.trim().length > 255) {
    errors.push('El guard_name no puede exceder 255 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Datos de validación inválidos",
      data: { errors }
    });
  }

  next();
};

/**
 * Validador para asignar permisos a un rol
 */
export const validateAssignPermissions = (req: Request, res: Response, next: NextFunction) => {
  const { permission_ids } = req.body;
  const { id } = req.params;
  const errors: string[] = [];

  // Validar ID del rol
  if (!id) {
    errors.push('El ID del rol es requerido');
  } else if (isNaN(Number(id))) {
    errors.push('El ID del rol debe ser un número válido');
  }

  // Validar permission_ids
  if (!permission_ids) {
    errors.push('Los IDs de permisos son requeridos');
  } else if (!Array.isArray(permission_ids)) {
    errors.push('Los IDs de permisos deben ser un array');
  } else if (permission_ids.length === 0) {
    errors.push('Debe proporcionar al menos un ID de permiso');
  } else {
    // Validar que todos los elementos del array sean números válidos
    permission_ids.forEach((permissionId: any, index: number) => {
      if (isNaN(Number(permissionId))) {
        errors.push(`El ID de permiso en la posición ${index} debe ser un número válido`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Datos de validación inválidos",
      data: { errors }
    });
  }

  next();
};

/**
 * Validador para parámetros de ID
 */
export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const errors: string[] = [];

  if (!id) {
    errors.push('El ID es requerido');
  } else if (isNaN(Number(id))) {
    errors.push('El ID debe ser un número válido');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Parámetro de ID inválido",
      data: { errors }
    });
  }

  next();
};

/**
 * Validador para parámetros de roleId y permissionId
 */
export const validateRolePermissionParams = (req: Request, res: Response, next: NextFunction) => {
  const { roleId, permissionId } = req.params;
  const errors: string[] = [];

  // Validar roleId
  if (!roleId) {
    errors.push('El ID del rol es requerido');
  } else if (isNaN(Number(roleId))) {
    errors.push('El ID del rol debe ser un número válido');
  }

  // Validar permissionId
  if (!permissionId) {
    errors.push('El ID del permiso es requerido');
  } else if (isNaN(Number(permissionId))) {
    errors.push('El ID del permiso debe ser un número válido');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Parámetros inválidos",
      data: { errors }
    });
  }

  next();
};

/**
 * Validador para sanitizar datos de entrada
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitizar strings eliminando espacios en blanco al inicio y final
  if (req.body.name) {
    req.body.name = req.body.name.trim();
  }
  if (req.body.guard_name) {
    req.body.guard_name = req.body.guard_name.trim();
  }

  next();
};
