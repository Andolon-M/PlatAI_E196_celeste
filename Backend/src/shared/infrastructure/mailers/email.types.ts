export type EmailTheme = 'light' | 'dark' | 'auto';

export interface EmailAction {
  /**
   * Texto visible del botón (CTA).
   */
  title: string;
  /**
   * Enlace al que redirige el botón.
   */
  url: string;
}

export interface SendTemplatedEmailInput {
  to: string;
  subject: string;
  /**
   * Texto principal del correo (sin HTML). Se renderiza dentro de la plantilla.
   * Puedes incluir saltos de línea con \n.
   */
  contentText: string;
  /**
   * Nombre visible del destinatario (opcional). Solo se usa para el saludo.
   */
  recipientName?: string;
  /**
   * Forzar tema. En la mayoría de clientes el "auto" depende de soporte de prefers-color-scheme.
   */
  theme?: EmailTheme;
  /**
   * Botón de acción opcional (CTA).
   */
  action?: EmailAction;
}

