# Backend - API REST con Node.js

Este documento explica cómo poner en marcha el backend, qué comandos usar y cómo está organizado el código. Está pensado para personas que están empezando en programación.

---

## Requisitos previos

Antes de empezar necesitas tener instalado en tu computadora:

- **Node.js** (versión 18 o superior) – [Descargar Node.js](https://nodejs.org/)
- **npm** – viene incluido con Node.js (es el gestor de paquetes)
- **Base de datos** – el proyecto usa MySQL/MariaDB; debes tener un servidor de base de datos instalado o acceso a uno

---

## Comandos básicos de npm

Abre una terminal en la carpeta `Backend` y ejecuta estos comandos en el orden indicado cuando sea necesario.

### 1. `npm i` (o `npm install`)

**¿Qué hace?**  
Instala todas las dependencias del proyecto (librerías y herramientas que el código necesita para funcionar).

**¿Cuándo usarlo?**  
- La primera vez que clonas o descargas el proyecto  
- Cuando alguien añade una dependencia nueva al `package.json`  
- Si borras la carpeta `node_modules`

**Ejemplo:**
```bash
npm i
```

---

### 2. `npm run dev`

**¿Qué hace?**  
Inicia el servidor en **modo desarrollo**:

- Levanta la API (por defecto en `http://localhost:3000`)
- Recarga el servidor automáticamente cuando cambias código (no hace falta reiniciar a mano)
- Opcionalmente puede abrir Prisma Studio para ver/editar la base de datos

**¿Cuándo usarlo?**  
Cuando estás programando y quieres probar los cambios en local.

**Ejemplo:**
```bash
npm run dev
```

---

### 3. `npm run build`

**¿Qué hace?**  
Compila el proyecto TypeScript a JavaScript y deja los archivos listos para producción en la carpeta `dist/`. También genera el cliente de Prisma según el esquema de la base de datos.

**¿Cuándo usarlo?**  
Antes de desplegar la aplicación en un servidor o cuando quieres ejecutar la versión “final” con `npm run start`.

**Ejemplo:**
```bash
npm run build
```

---

### 4. `npm run start`

**¿Qué hace?**  
Ejecuta la aplicación ya compilada (la que generó `npm run build`). Usa los archivos de la carpeta `dist/` y no recarga al cambiar el código.

**¿Cuándo usarlo?**  
En entornos de producción o cuando quieres probar la versión compilada en tu máquina.

**Requisito:** Debes haber ejecutado antes `npm run build`.

**Ejemplo:**
```bash
npm run start
```

---

## Comandos básicos de Prisma

Prisma es la herramienta que conecta la aplicación con la base de datos. Con Prisma defines tus tablas en un archivo (`schema.prisma`) y luego generas migraciones y el cliente para usarlas en código.

### Ubicación del esquema

El esquema de la base de datos está en:

```
Backend/prisma/schema.prisma
```

### Comandos más usados

| Comando | ¿Qué hace? |
|--------|-------------|
| `npx prisma generate` | Lee `schema.prisma` y genera el cliente de Prisma (código que usas para hacer consultas). Hay que ejecutarlo después de cambiar el esquema o al hacer `npm run build` / `npm run dev`. |
| `npx prisma migrate dev` | Crea una nueva migración con los cambios del esquema y la aplica a la base de datos. Usar en desarrollo. |
| `npx prisma migrate deploy` | Aplica las migraciones pendientes sin crear nuevas. Usar en producción. |
| `npx prisma studio` | Abre una interfaz web para ver y editar los datos de la base de datos (muy útil para depurar). |
| `npx prisma db push` | Sincroniza el esquema con la base de datos sin generar archivos de migración (útil en prototipos; en proyectos serios suele usarse `migrate`). |

**Ejemplos:**

```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear y aplicar una migración (desarrollo)
npx prisma migrate dev --name descripcion_del_cambio

# Abrir Prisma Studio
npx prisma studio
```

En este proyecto, `npm run dev` y `npm run build` ya ejecutan `prisma generate` por ti, pero si cambias `schema.prisma` a mano, recuerda volver a generar:

```bash
npx prisma generate
```

---

## Arquitectura del proyecto (ejemplo: módulo de usuarios)

El backend está organizado por **módulos**. Cada módulo agrupa todo lo relacionado con una parte de la aplicación (usuarios, autenticación, etc.). Aquí se explica con el **módulo de usuarios** como ejemplo.

### Estructura de carpetas de un módulo

Para el módulo de usuarios, la estructura típica es algo así:

```
Backend/src/modules/users/
├── routers/           → Define las rutas HTTP (URLs) y qué función se ejecuta
├── application/
│   ├── controllers/   → Recibe la petición HTTP y devuelve la respuesta
│   ├── services/      → Lógica de negocio (reglas, validaciones, orquestación)
│   └── validators/    → Validación de los datos que llegan (body, query, params)
└── infrastructure/
    └── repositories/  → Acceso a la base de datos (consultas con Prisma)
```

### Flujo de una petición (ejemplo: “crear usuario”)

Cuando alguien hace una petición **POST** a `/users` con los datos del usuario, el flujo es:

1. **Rutas (`routers/users.routes.ts`)**  
   - Define que `POST /users` existe.  
   - Asocia esa ruta a middlewares (autenticación, permisos, validación) y al controlador.

2. **Validador (`application/validators/users.validator.ts`)**  
   - Comprueba que el cuerpo de la petición tenga el formato correcto (por ejemplo, email válido, campos obligatorios).

3. **Controlador (`application/controllers/users.controller.ts`)**  
   - Recibe la petición (`req`) y la respuesta (`res`).  
   - Extrae los datos del cuerpo, llama al servicio y, según el resultado, envía una respuesta HTTP (201, 400, 500, etc.).

4. **Servicio (`application/services/users.service.ts`)**  
   - Contiene la **lógica de negocio**: comprobar si el email ya existe, hashear la contraseña, enviar un correo de bienvenida, etc.  
   - No sabe nada de HTTP; solo recibe datos y devuelve resultados.  
   - Para leer o guardar en base de datos llama al repositorio.

5. **Repositorio (`infrastructure/repositories/users.repository.ts`)**  
   - Es el único que habla con la base de datos usando **Prisma** (por ejemplo, `prisma.users.create(...)`).  
   - Devuelve los datos tal como vienen de la base de datos.

En resumen: **Ruta → Validador → Controlador → Servicio → Repositorio → Base de datos**.  
Para otras operaciones (listar usuarios, actualizar, eliminar) el flujo es el mismo; solo cambian el método HTTP y la función del controlador/servicio/repositorio.

### Por qué esta arquitectura

- **Controladores**: solo se encargan de HTTP (entrada/salida).  
- **Servicios**: concentran la lógica para que sea reutilizable y fácil de testear.  
- **Repositorios**: centralizan el acceso a datos; si cambias de base de datos, solo tocas esta capa.

Así, si mañana quieres que “crear usuario” también envíe un SMS, solo añades esa lógica en el **servicio**, sin tocar rutas ni repositorio.

---

## El archivo `.env` y cómo usarlo

### ¿Qué es el `.env`?

El `.env` es un archivo de **configuración** que guarda **variables de entorno**: cosas como la URL de la base de datos, el puerto del servidor, claves secretas, etc. El código las lee con `process.env.NOMBRE_VARIABLE`.

- **No se sube a Git** (está en `.gitignore`) para no exponer contraseñas o claves.  
- Cada persona o entorno (tu PC, el servidor de producción) tiene su propio `.env` con sus propios valores.

### ¿Para qué sirve?

- Cambiar configuración (puerto, base de datos, URLs) **sin tocar el código**.  
- Usar datos distintos en desarrollo y en producción (por ejemplo, una base de datos de prueba en tu PC y otra en el servidor).  
- Mantener **secretos** (contraseñas, API keys) fuera del código.

### Cómo usarlo

1. **Crear el archivo**  
   En la carpeta `Backend` crea un archivo llamado exactamente `.env` (con el punto delante).

2. **Copiar desde el ejemplo**  
   Suele existir un archivo `.env.example` con todas las variables que el proyecto usa, pero sin valores reales (o con placeholders). Copia ese archivo y renómbralo a `.env`:
   ```bash
   copy .env.example .env
   ```
   (En Linux/Mac: `cp .env.example .env`)

3. **Completar los valores**  
   Abre `.env` con un editor de texto y sustituye los valores de ejemplo por los tuyos:
   - **DATABASE_URL**: usuario, contraseña, host, puerto y nombre de la base de datos de MySQL/MariaDB.
   - **EXPRESS_PORT**: puerto donde quieres que escuche la API (por ejemplo `3000`).
   - **JWT_SECRET**, **GOOGLE_CLIENT_ID**, etc.: según lo que use el proyecto (auth, OAuth, etc.).

4. **No compartir ni subir `.env`**  
   No lo envíes por correo, no lo subas a GitHub ni lo pongas en un repositorio público. El resto del equipo puede usar su propio `.env` a partir de `.env.example`.

### Ejemplo mínimo de `.env`

```env
# Servidor
EXPRESS_PORT=3000

# Base de datos (reemplaza user, password, host, port y database por tus datos)
DATABASE_URL=mysql://user:password@localhost:3306/nombre_base_datos

# Entorno
NODE_ENV=development
EXPRESS_PRODUCTION=false

# Seguridad (cambia este valor por uno secreto y aleatorio)
JWT_SECRET=tu_clave_secreta_muy_larga_y_aleatoria
```

Las variables que necesites dependen del proyecto; la lista completa suele estar en `.env.example`.

### Resumen

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué es `.env`? | Archivo con variables de configuración y secretos. |
| ¿Dónde va? | En la raíz del Backend (donde está `package.json`). |
| ¿Se sube a Git? | No. Solo se sube `.env.example` (sin datos sensibles). |
| ¿Cómo se usa en código? | Con `process.env.NOMBRE_VARIABLE` (por ejemplo `process.env.DATABASE_URL`). |

---

## Resumen rápido de comandos

| Acción | Comando |
|--------|---------|
| Instalar dependencias | `npm i` |
| Desarrollar (servidor con recarga) | `npm run dev` |
| Compilar para producción | `npm run build` |
| Ejecutar versión compilada | `npm run start` |
| Generar cliente Prisma | `npx prisma generate` |
| Crear/aplicar migraciones (desarrollo) | `npx prisma migrate dev --name nombre_cambio` |
| Ver datos en el navegador | `npx prisma studio` |

Si tienes dudas sobre algún comando o carpeta, revisa la sección correspondiente más arriba.
