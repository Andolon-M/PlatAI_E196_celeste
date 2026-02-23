# Mailer compartido (plantilla corporativa)

Este módulo centraliza **la plantilla HTML** y **la lógica de envío** de correos.  
Los módulos solo deben llamar a `sendTemplatedEmail(...)` enviando `subject` y `contentText` (y opcionalmente `recipientName`, `theme`, `action`).

## Import (desde cualquier módulo)

```ts
import { sendTemplatedEmail } from '../../../shared/infrastructure/mailers';
```

> Ajusta el `../../../` según la ubicación de tu archivo.

## Variables de entorno (SMTP)

Configura estas variables (por ejemplo en tu `.env`):

- `EMAIL_SMTP_HOST`
- `EMAIL_SMTP_PORT` (default: `587`)
- `EMAIL_SMTP_SECURE` (`true` para 465, `false` para 587)
- `EMAIL_SMTP_USER`
- `EMAIL_SMTP_PASS`
- `EMAIL_FROM_NAME` (opcional, default: `Finanzas App Admin`)
- `EMAIL_FROM_ADDRESS` (opcional, default: `EMAIL_SMTP_USER`)

## Envío básico (solo asunto + texto)

```ts
await sendTemplatedEmail({
  to: 'usuario@dominio.com',
  subject: 'Bienvenido a Finanzas App',
  recipientName: 'Andolon',
  contentText: [
    'Tu cuenta ha sido creada exitosamente.',
    '',
    'Si tienes preguntas, responde a este correo.',
  ].join('\n'),
});
```

## Tema (light/dark/auto)

```ts
await sendTemplatedEmail({
  to: 'usuario@dominio.com',
  subject: 'Notificación',
  contentText: 'Hola\n\nEste es un mensaje.',
  theme: 'auto', // 'light' | 'dark' | 'auto'
});
```

## Botón de acción (CTA)

Para renderizar un botón, envía `action`:

```ts
await sendTemplatedEmail({
  to: 'usuario@dominio.com',
  subject: 'Restablecer contraseña',
  contentText: [
    'Recibimos una solicitud para restablecer tu contraseña.',
    '',
    'Si fuiste tú, usa el botón:',
  ].join('\n'),
  action: {
    title: 'Restablecer contraseña',
    url: 'https://miApp.com/reset?token=...',
  },
});
```

### Insertar el botón “en medio” del texto

Si quieres que el botón aparezca exactamente entre dos párrafos, coloca el marcador:

- `{{ACTION_BUTTON}}`

Ejemplo:

```ts
await sendTemplatedEmail({
  to: 'usuario@dominio.com',
  subject: 'Inicio de sesión - Finanzas App',
  recipientName: 'Andolon',
  contentText: [
    'Hemos detectado un inicio de sesión en tu cuenta.',
    'Si no fuiste tú, por favor cambia tu contraseña inmediatamente.',
    '',
    '{{ACTION_BUTTON}}',
    '',
    'Si no solicitaste este cambio, puedes ignorar este correo.',
  ].join('\n'),
  action: {
    title: 'Ingresar al sistema',
    url: 'https://app.miApp.com/login',
  },
});
```

Notas:
- Si **no** incluyes `{{ACTION_BUTTON}}`, el botón (si existe `action`) se agrega **al final**.
- El botón está construido como “bulletproof button” (tabla + VML) para mejor compatibilidad con clientes como Outlook.

