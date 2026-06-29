# Plinto.cl

Sitio web del estudio de estrategia, contenido y comunicación [Plinto](https://plinto.cl), especializado en marcas del mundo de la arquitectura y la construcción en Chile. Desarrollado con Astro y desplegado en Cloudflare Pages.

---

## Qué es este repositorio

Este repo contiene el sitio completo de Plinto: la presentación del estudio, el portafolio de proyectos, la página de servicios, el equipo y el contacto. El sitio es completamente estático — no hay servidor, no hay base de datos. Todo se genera en tiempo de compilación.

## Tecnologías principales

- [Astro 7](https://astro.build) con salida estática
- TypeScript
- Vanilla CSS (sin frameworks de estilos)
- Cloudflare Pages para despliegue
- Playwright para testing de accesibilidad
- Lighthouse CI para auditorías de rendimiento

## Desarrollo local

Requiere Node.js ≥ 22 y npm.

```bash
npm install
npm run dev
```

El sitio queda disponible en `http://localhost:4321`.

## Comandos

| Comando                   | Descripción                                                    |
| ------------------------- | -------------------------------------------------------------- |
| `npm run dev`             | Servidor de desarrollo local                                   |
| `npm run build`           | Valida TypeScript y genera la versión de producción en `dist/` |
| `npm run preview`         | Sirve la compilación de producción localmente                  |
| `npm run format`          | Formatea el código con Prettier                                |
| `npm run lint`            | Ejecuta ESLint y Stylelint                                     |
| `npm run test`            | Tests de accesibilidad con Playwright                          |
| `npm run test:lighthouse` | Auditoría de rendimiento con Lighthouse CI                     |

## Estructura del proyecto

```
src/
  content/work/     # Fichas de proyectos en MDX
  pages/            # Rutas del sitio y endpoints estáticos
  layouts/          # Layout base compartido
  components/       # Componentes reutilizables
  styles/           # CSS organizado por responsabilidad
  utils/schema.ts   # Generador de Schema.org
public/
  _headers          # Headers HTTP de Cloudflare Pages
  assets/           # Fuentes, íconos y scripts
```

## Portafolio de proyectos

Los proyectos del portafolio se definen como archivos MDX en `src/content/work/`. Cada entrada incluye título, cliente, servicio, año, imágenes, resumen y metadatos SEO. Para agregar un nuevo proyecto, basta con crear un nuevo archivo MDX siguiendo la estructura de los existentes y ejecutar `npm run build`.

## Despliegue

El sitio se despliega automáticamente en Cloudflare Pages al hacer push a `main`. La configuración de build es:

- **Comando de build**: `npm run build`
- **Directorio de salida**: `dist`

No se usa ningún adaptador de Astro — el proyecto es puramente estático.

## Notas

- El sitio está configurado en español de Chile (`lang="es-CL"`).
- `dist/` y otros archivos generados no forman parte del repositorio.
- No subas archivos `.env` ni secretos al repositorio.
