# Frontend - Aplicación React con Vite

Este documento explica cómo poner en marcha el frontend, qué comandos usar y cómo está organizado el código. También describe cómo se consumen los endpoints del backend (axios, token, toasts). Está pensado para personas que están empezando en programación.

---

## Requisitos previos

Antes de empezar necesitas tener instalado en tu computadora:

- **Node.js** (versión 18 o superior) – [Descargar Node.js](https://nodejs.org/)
- **npm** – viene incluido con Node.js
- Que el **backend** esté corriendo (o tener la URL de la API configurada en `.env`) para que el frontend pueda hacer peticiones a la API

---

## Comandos básicos de npm

Abre una terminal en la carpeta `Frontend` y ejecuta estos comandos cuando sea necesario.

### 1. `npm i` (o `npm install`)

**¿Qué hace?**  
Instala todas las dependencias del proyecto (React, Vite, Axios, componentes de UI, etc.).

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
Inicia la aplicación en **modo desarrollo**:

- Levanta el servidor de desarrollo (por defecto en `http://localhost:5173`)
- Recarga la página automáticamente cuando cambias código (hot reload)
- Los errores se muestran en la consola del navegador

**¿Cuándo usarlo?**  
Cuando estás programando y quieres ver los cambios en el navegador al instante.

**Ejemplo:**
```bash
npm run dev
```

---

### 3. `npm run build`

**¿Qué hace?**  
Compila el proyecto (TypeScript + React) y genera los archivos listos para producción en la carpeta `dist/`. Esos archivos son los que luego se suben a un servidor o a un hosting.

**¿Cuándo usarlo?**  
Antes de desplegar la aplicación en un servidor o cuando quieres probar la versión optimizada con `npm run preview`.

**Ejemplo:**
```bash
npm run build
```

---

### 4. `npm run preview`

**¿Qué hace?**  
Sirve la versión ya compilada (la carpeta `dist/`) en local para que puedas probar cómo se verá en producción. No recarga al cambiar el código; para eso debes volver a hacer `npm run build`.

**¿Cuándo usarlo?**  
Cuando quieres comprobar que el build de producción funciona bien antes de subir a un servidor.

**Requisito:** Debes haber ejecutado antes `npm run build`.

**Ejemplo:**
```bash
npm run preview
```

---

### 5. `npm run lint`

**¿Qué hace?**  
Revisa el código con ESLint y te avisa de posibles errores o malas prácticas (por ejemplo, variables no usadas, formato inconsistente).

**¿Cuándo usarlo?**  
Cuando quieres revisar que el código cumple las reglas del proyecto antes de hacer un commit o un pull request.

**Ejemplo:**
```bash
npm run lint
```

---

## Arquitectura del proyecto (ejemplo: módulo de usuarios)

El frontend está organizado por **módulos**. Cada módulo agrupa todo lo relacionado con una parte de la aplicación (usuarios, autenticación, roles, etc.). Aquí se explica con el **módulo de usuarios** como ejemplo.

### Estructura de carpetas de un módulo

Para el módulo de usuarios, la estructura típica es:

```
Frontend/src/modules/users/
├── components/     → Componentes de UI (tabla, diálogos de crear/editar)
├── hooks/          → Hooks que llaman al servicio y guardan estado (ej. useUsers)
├── pages/          → Páginas que se muestran en una ruta (ej. UsersPage)
├── services/      → Llamadas al backend (usuarios.service.ts usa axios)
└── types/         → Tipos TypeScript (User, CreateUserRequest, etc.)
```

### Flujo de una operación (ejemplo: “listar usuarios”)

Cuando el usuario entra en la página de usuarios (`/admin/users`), el flujo es:

1. **Página (`pages/users-page.tsx`)**  
   - Renderiza la pantalla (tabla, botones, filtros).  
   - Usa el hook `useUsers(filters)` para obtener la lista y las funciones crear/editar/eliminar.

2. **Hook (`hooks/use-users.ts`)**  
   - Guarda el estado (lista de usuarios, carga, errores, paginación).  
   - Llama al **servicio** para traer datos o para crear/actualizar/eliminar.  
   - Después de una acción exitosa puede volver a cargar la lista (por ejemplo `fetchUsers()`).

3. **Servicio (`services/users.service.ts`)**  
   - Contiene las funciones que hacen las peticiones HTTP al backend: `getUsers()`, `createUser()`, `updateUser()`, `deleteUser()`, etc.  
   - Usa **axios** (la instancia configurada del proyecto, no axios directo) y las rutas definidas en **endpoints**.  
   - No sabe nada de React; solo recibe datos y devuelve promesas con la respuesta.

4. **Axios (configuración compartida)**  
   - Añade el **token** de autenticación en cada petición (interceptor).  
   - Gestiona errores globales y muestra **toasts** (éxito o error) según la respuesta del backend.

En resumen: **Página → Hook → Servicio → Axios → Backend**.  
Para otras operaciones (crear, editar, eliminar usuario) el flujo es el mismo; la página y el hook llaman a la función del servicio que corresponda.

### Por qué esta arquitectura

- **Páginas**: solo se preocupan de mostrar la UI y de conectar con hooks.  
- **Hooks**: concentran la lógica de “qué datos necesito” y “qué hacer al crear/editar/eliminar”.  
- **Servicios**: centralizan las llamadas al backend; si la API cambia, solo tocas aquí.  
- **Axios configurado**: un solo lugar para token, URLs base y comportamiento ante errores (toasts, redirección al login si hay 401).

Así, si mañana el backend cambia la URL de “crear usuario”, solo cambias el endpoint en el servicio (o en el archivo de endpoints); las páginas y los hooks no necesitan tocar las URLs.

---

## Cómo se consumen los endpoints del backend

El frontend usa **Axios** para hablar con la API. Hay tres piezas importantes: la **instancia de axios**, el **archivo de endpoints** y el **token**.

### 1. Instancia de Axios (`src/shared/api/axios.config.ts`)

Se crea una instancia de axios con:

- **baseURL**: la URL base de la API (por ejemplo `http://localhost:3000`). Se lee de la variable de entorno `VITE_API_BASE_URL` en el archivo `.env`.
- **timeout**: tiempo máximo de espera (por ejemplo 30 segundos).
- **headers**: por defecto `Content-Type: application/json`.

Todas las peticiones al backend deben usar esta instancia (importada como `axiosInstance`), **no** el `axios` por defecto. Así se aplican los interceptores (token y toasts).

### 2. Token de autenticación (interceptor de request)

En `axios.config.ts` hay un **interceptor de request** que se ejecuta **antes** de cada petición:

1. Lee el token del `localStorage` (clave `"token"`).
2. Si existe token, añade en la cabecera: `Authorization: Bearer <token>`.
3. El backend usa esa cabecera para saber quién es el usuario y si está autenticado.

El token se guarda en `localStorage` cuando el usuario hace **login** (o registro), en el servicio de autenticación (`auth.service.ts`), con `setToken(token)`. Si el backend devuelve **401 (no autorizado)**, el interceptor de **response** borra el token y redirige al login; no tienes que hacerlo a mano en cada pantalla.

### 3. Registro de endpoints (`src/shared/api/enpoints.ts`)

En este archivo están definidas **todas las URLs** de la API en un objeto llamado `API_ENDPOINTS`. Por ejemplo:

- **Auth**: `AUTH.LOGIN`, `AUTH.REGISTER`, `AUTH.ME`, `AUTH.LOGOUT`, etc.
- **Users**: `USERS.LIST`, `USERS.CREATE`, `USERS.UPDATE(id)`, `USERS.DELETE(id)`, `USERS.STATS`, etc.
- **Roles**, **Events**, **Files**, etc.

En el **servicio** no se escriben las URLs a mano; se usan estas constantes. Ejemplo en `users.service.ts`:

```ts
import { axiosInstance } from "@/shared/api/axios.config"
import { API_ENDPOINTS } from "@/shared/api/enpoints"

// Listar usuarios
const response = await axiosInstance.get(API_ENDPOINTS.USERS.LIST)

// Crear usuario
await axiosInstance.post(API_ENDPOINTS.USERS.CREATE, data)

// Actualizar usuario (la URL lleva el id)
await axiosInstance.put(API_ENDPOINTS.USERS.UPDATE(id), data)
```

Si añades un endpoint nuevo en el backend, lo registras en `enpoints.ts` y luego lo usas en el servicio correspondiente.

### Resumen: consumo del backend

| Qué | Dónde | Para qué |
|-----|--------|----------|
| URL base de la API | Variable `VITE_API_BASE_URL` en `.env` | Que axios sepa a qué servidor llamar |
| Token | `localStorage` clave `"token"`; lo añade el interceptor | Autenticación en cada petición |
| Endpoints | `src/shared/api/enpoints.ts` | Tener todas las rutas en un solo sitio |
| Peticiones HTTP | Servicios (ej. `users.service.ts`) usando `axiosInstance` | Llamar al backend desde un solo lugar y reutilizar |

---

## Uso de toasts (notificaciones)

Las notificaciones tipo “toast” (mensajes que aparecen unos segundos en una esquina) se hacen con la librería **Sonner**. Sirven para informar al usuario de éxito o error sin bloquear la pantalla.

### Dónde está el Toaster

En `src/main.tsx` se renderiza el componente `<Toaster />` (de `@/shared/components/ui/sonner`). Debe estar montado una sola vez en la aplicación para que los toasts se muestren. No hace falta volver a ponerlo en cada página.

### Toasts automáticos (axios)

En `axios.config.ts`, el **interceptor de response** ya muestra toasts:

- **Éxito**: si el backend devuelve un `message` en la respuesta y la petición no es GET, se muestra `toast.success(message)`.
- **Error**: según el código HTTP (400, 401, 403, 404, 422, 500 o sin respuesta), se muestra `toast.error(mensaje)` con un texto adecuado. En 401 además se borra el token y se redirige al login.

Por tanto, en la mayoría de los casos **no necesitas llamar a toast a mano** en los servicios ni en los hooks: el usuario ya verá el mensaje de éxito o error. Solo si quieres un mensaje extra o distinto en algún flujo concreto, usas `toast` manualmente.

### Cómo usar toasts a mano

Si en algún componente o hook quieres mostrar un toast tú mismo (por ejemplo un mensaje de “Guardado correctamente” con otro texto), importas `toast` de Sonner y llamas a:

```ts
import { toast } from "sonner"

// Éxito
toast.success("Usuario creado correctamente", { duration: 3000 })

// Error
toast.error("No se pudo guardar. Intenta de nuevo.", { duration: 4000 })

// Info (opcional)
toast.info("Procesando...")
```

`duration` es el tiempo en milisegundos que se muestra el toast. Si no lo pones, Sonner usa un valor por defecto.

### Resumen de toasts

| Situación | Qué hacer |
|-----------|-----------|
| Respuesta exitosa o error del backend | Lo gestiona el interceptor de axios; no hace falta código extra. |
| Mensaje personalizado en tu componente | `import { toast } from "sonner"` y usar `toast.success()` o `toast.error()`. |
| Que los toasts se vean en la app | Mantener `<Toaster />` en `main.tsx`. |

---

## El archivo `.env` y la URL del backend

### ¿Qué es el `.env`?

El `.env` es un archivo de **configuración** donde se guardan variables que pueden cambiar según el entorno (tu PC, el servidor de producción). En el frontend, la más importante para consumir el backend es la **URL base de la API**.

- **No se sube a Git** (está en `.gitignore`) para no exponer URLs internas o secretos.  
- En Vite, las variables que quieras usar en el código deben empezar por `VITE_` (por ejemplo `VITE_API_BASE_URL`).

### Cómo usarlo

1. **Crear el archivo**  
   En la carpeta `Frontend` crea un archivo llamado `.env`.

2. **Definir la URL del backend**  
   Si tu API corre en `http://localhost:3000`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```
   En producción pondrías la URL real del servidor (por ejemplo `https://api.miapp.com`).

3. **Usar la variable en código**  
   En `axios.config.ts` ya se usa así: `baseURL: import.meta.env.VITE_API_BASE_URL`. No hace falta cambiar nada más si solo quieres apuntar a otro servidor.

### Ejemplo mínimo de `.env` (desarrollo)

```env
# URL del backend (donde corre la API)
VITE_API_BASE_URL=http://localhost:3000
```

Si el backend usa otro puerto, cambia el número (por ejemplo `http://localhost:3001`).

### Resumen

| Pregunta | Respuesta |
|----------|-----------|
| ¿Para qué sirve `.env` en el front? | Sobre todo para la URL base del backend (`VITE_API_BASE_URL`). |
| ¿Dónde va? | En la raíz del Frontend (donde está `package.json`). |
| ¿Se sube a Git? | No. Solo se puede subir un `.env.example` con nombres de variables sin valores sensibles. |
| ¿Cómo se usa en código? | Con `import.meta.env.VITE_API_BASE_URL` (en Vite). |

---

## Resumen rápido de comandos

| Acción | Comando |
|--------|---------|
| Instalar dependencias | `npm i` |
| Desarrollar (recarga automática) | `npm run dev` |
| Compilar para producción | `npm run build` |
| Probar la versión compilada | `npm run preview` |
| Revisar código con ESLint | `npm run lint` |

---

## Resumen rápido: arquitectura y consumo del backend

| Paso | Dónde | Qué hace |
|------|--------|----------|
| 1 | Página (ej. `UsersPage`) | Usa un hook y muestra la UI. |
| 2 | Hook (ej. `useUsers`) | Llama al servicio y guarda estado (lista, carga, errores). |
| 3 | Servicio (ej. `users.service.ts`) | Usa `axiosInstance` y `API_ENDPOINTS` para hacer GET/POST/PUT/DELETE al backend. |
| 4 | Axios (interceptor) | Añade el token en cada petición; en respuestas muestra toasts de éxito/error y en 401 redirige al login. |

Si tienes dudas sobre algún comando, carpeta o flujo, revisa la sección correspondiente más arriba.
