# Despliegue en Vercel

## 📋 Configuración

El proyecto está configurado para desplegarse en Vercel con el archivo `vercel.json`.

## 🚀 Despliegue

### Opción 1: Despliegue desde el Dashboard de Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente la configuración
5. Click en "Deploy"

### Opción 2: Despliegue desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

## ⚙️ Variables de Entorno

Asegúrate de configurar las siguientes variables de entorno en Vercel:

### En el Dashboard de Vercel:
1. Ve a tu proyecto
2. Settings → Environment Variables
3. Agrega las siguientes variables:

```
VITE_API_BASE_URL=https://tu-api.com/api
```

### Desde CLI:
```bash
vercel env add VITE_API_BASE_URL
```

## 📝 Configuración del Proyecto

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**¿Qué hace cada configuración?**

- **`buildCommand`**: Comando que Vercel ejecuta para construir el proyecto
- **`outputDirectory`**: Carpeta que contiene los archivos estáticos compilados
- **`rewrites`**: Redirige todas las rutas a `index.html` para que React Router funcione

### Rewrites para SPA

El rewrite `/(.*) → /index.html` es esencial porque:

1. Cuando visitas `https://tu-app.vercel.app/admin/users`
2. Vercel intenta buscar el archivo `/admin/users/index.html`
3. Como no existe (es una SPA), el rewrite lo redirige a `/index.html`
4. React Router toma el control y muestra la página correcta

## 🔄 Actualizaciones Automáticas

Vercel está configurado para:

- ✅ Desplegar automáticamente cada push a `main`
- ✅ Crear preview deployments para cada Pull Request
- ✅ Ejecutar el build y mostrar errores si falla

## 🌐 Dominios

### Dominio de Vercel (automático)
```
https://tu-proyecto.vercel.app
```

### Dominio Personalizado

1. Ve a Settings → Domains
2. Agrega tu dominio: `myApp.com`
3. Configura los DNS según las instrucciones de Vercel
4. Espera a que se verifique (puede tomar hasta 48h)

## 📊 Build Logs

Si el despliegue falla, revisa los logs en:
1. Dashboard de Vercel
2. Deployments → Click en el deployment fallido
3. Build Logs

## ⚡ Optimizaciones

### Cache de Assets
Los archivos en `/assets/` tienen cache de 1 año:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Análisis de Bundle
Después del despliegue, Vercel muestra:
- Tamaño del bundle
- Tiempo de build
- Core Web Vitals

## 🐛 Troubleshooting

### Error: "Build failed"
- Verifica que `npm run build` funcione localmente
- Revisa los logs de build en Vercel
- Asegúrate de que todas las dependencias estén en `package.json`

### Error: "404 en rutas"
- Verifica que `vercel.json` tenga el rewrite configurado
- Asegúrate de que el `outputDirectory` sea `dist`

### Error: "Environment variables undefined"
- Verifica que las variables estén configuradas en Vercel
- Recuerda que deben empezar con `VITE_` para que Vite las exponga

### Rutas no funcionan después del despliegue
- El rewrite `/(.*) → /index.html` debe estar configurado
- Redeploy el proyecto después de agregar `vercel.json`

## 📱 Testing

### Preview Deployment
Cada PR crea un preview deployment:
```
https://tu-proyecto-git-branch-name-tu-usuario.vercel.app
```

### Producción
```
https://tu-proyecto.vercel.app
https://tu-dominio.com
```

## 🔒 Seguridad

### Headers de Seguridad (Opcional)

Puedes agregar headers de seguridad en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## ✅ Checklist de Despliegue

- [ ] `vercel.json` configurado
- [ ] Variables de entorno configuradas
- [ ] `npm run build` funciona localmente
- [ ] Repositorio conectado a Vercel
- [ ] Dominio personalizado configurado (opcional)
- [ ] SSL/HTTPS habilitado (automático en Vercel)

## 📚 Recursos

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Custom Domains](https://vercel.com/docs/custom-domains)
- [Environment Variables](https://vercel.com/docs/environment-variables)

