const production = process.env.EXPRESS_PRODUCTION?.toLowerCase() === 'true';

// En producción: BASE_URL y API_BASE_URL = solo dominio (ej. miApp.com).
// apiBaseUrl = origen + '/api' para evitar api/api en Swagger y enlaces.
function productionOrigin(envVar: string): string {
  const base = (process.env[envVar] ?? '').trim().replace(/\/+$/, '');
  if (!base) return '';
  const href = base.startsWith('http') ? base : `https://${base}`;
  return new URL(href).origin;
}

export const environment = {
  production,
  /** Origen del frontend (sin path). CORS usa esto como origen permitido. */
  baseUrl: production
    ? productionOrigin('BASE_URL') || productionOrigin('API_BASE_URL')
    : `http://${process.env.BASE_URL_LOCAL}:${Number(process.env.EXPRESS_PORT ?? '3000') + 1}`,
  /** URL base de la API (ej. https://miApp.com/api). En prod siempre origen + /api. */
  apiBaseUrl: production
    ? `${productionOrigin('API_BASE_URL')}/api`
    : `http://${process.env.API_BASE_URL_LOCAL}:${Number(process.env.EXPRESS_PORT ?? '3000')}`,
};