# Gestión de Franquiciados - Albroksa

Sistema de gestión de leads y franquicias para Albroksa.

## Configuración

1. Copia el archivo `.env.example` a `.env`
2. Configura las variables de entorno con tus credenciales de Supabase
3. Instala las dependencias: `npm install`
4. Inicia el servidor de desarrollo: `npm run dev`

## Variables de Entorno Requeridas

- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase

## Producción

Para construir la aplicación para producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

## Usuarios por Defecto

Los usuarios deben ser creados a través de la interfaz de administración en `/settings/users`

## Licencia

© 2025 Albroksa - Todos los derechos reservados
