# Sistema de Gestión de Eventos e Iglesia

Este sistema está diseñado para gestionar eventos, miembros, ministerios y asistencias dentro de una iglesia o comunidad religiosa.

## Lógica de Negocio

### Miembros

Los miembros pueden tener tres estados diferentes:

- **ASISTENTE**: Estado por defecto para nuevos miembros. Son aquellos que no pertenecen a ningún ministerio como equipo de trabajo o líder.
- **ACTIVO**: Miembros que pertenecen al menos a un ministerio como parte del equipo de trabajo o como líder.
- **INACTIVO**: Estado asignado manualmente por un administrador. Un miembro inactivo no puede permanecer como líder o parte del equipo de trabajo en ningún ministerio.

El cambio de estados se gestiona de la siguiente manera:
- Al ingresar al sistema, todos los miembros son considerados **ASISTENTES**.
- Cuando un miembro es asignado como equipo de trabajo o líder en cualquier ministerio, automáticamente pasa a estado **ACTIVO**.
- Solo un administrador puede asignar el estado **INACTIVO** a un miembro. Al hacerlo, el sistema debe verificar que no tenga roles de líder o equipo en ningún ministerio.

### Ministerios

Los ministerios representan áreas de trabajo y servicio dentro de la organización. Cada ministerio tiene:

- Un nombre y descripción
- Miembros asociados con diferentes roles
- Potencialmente eventos asociados

Los roles dentro de un ministerio son:
- **MIEMBRO**: Participante regular del ministerio
- **EQUIPO**: Parte del equipo de trabajo con responsabilidades específicas
- **LIDER**: Responsable principal del ministerio

Un miembro puede pertenecer a múltiples ministerios y tener roles diferentes en cada uno.

### Eventos

Los eventos representan actividades organizadas que pueden tener:

- Múltiples sesiones (fechas u horarios)
- Control de asistencia
- Sistema de pagos (opcional)

Características principales:
- Un evento puede estar asociado a un ministerio específico o ser independiente
- Puede tener un costo asociado o ser gratuito
- Cada evento tiene un responsable (usuario del sistema)

### Asistencia a Eventos

El sistema de asistencia funciona de la siguiente manera:

1. Los miembros se registran para asistir a un evento (estado **REGISTRADO**)
2. Pueden confirmar su asistencia (estado **CONFIRMADO**)
3. El día del evento se registra su asistencia efectiva (estado **ASISTIO** o **AUSENTE**)
4. Un miembro puede cancelar su asistencia (estado **CANCELADO**)

Para eventos con costo:
- Se puede registrar si el pago está **PENDIENTE**, **PARCIAL**, **COMPLETO** o **EXONERADO**
- Para pagos parciales, se registra el monto abonado

### Sesiones de Eventos

Un evento puede tener múltiples sesiones con:
- Fechas y horarios específicos
- Ubicación específica (opcional, si es diferente del evento principal)
- Capacidad específica (opcional, si es diferente del evento principal)

Se registra la asistencia de cada miembro a cada sesión individualmente.

## Restricciones Importantes

1. Todos los asistentes a eventos deben estar registrados en la tabla de miembros.
2. Un miembro en estado INACTIVO no puede ser líder o equipo de trabajo en ningún ministerio.
3. Un miembro solo puede registrarse una vez por evento.
4. Un miembro solo puede tener un registro de asistencia por sesión de evento.
5. Un miembro solo puede tener un rol en cada ministerio.
