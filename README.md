# Plinto.cl

Sitio estatico desarrollado con Astro para Plinto, estudio enfocado en estrategia, contenidos y comunicacion para marcas de arquitectura y construccion.

## Stack

- `Astro 6` con output estatico
- `TypeScript`
- `@astrojs/mdx` para fichas de proyectos
- `@astrojs/sitemap` para generacion de sitemap
- `@astrojs/rss` para feed RSS
- `astro-robots-txt` para robots.txt
- `astro:assets` con `sharp` para optimizacion de imagenes
- `Playwright` + `@axe-core/playwright` para testing de accesibilidad
- `@lhci/cli` para Lighthouse CI
- `ESLint` + `eslint-plugin-astro` para linting
- `Prettier` para formateo
- `Stylelint` para linting de CSS

## Requisitos

- `Node.js` compatible con las dependencias definidas en `package-lock.json`
- `npm`

## Comandos

| Comando                   | Descripcion                                                         |
| ------------------------- | ------------------------------------------------------------------- |
| `npm install`             | Instala las dependencias del proyecto.                              |
| `npm run dev`             | Levanta el entorno local de desarrollo.                             |
| `npm run build`           | Ejecuta `astro check` y genera la version de produccion en `dist/`. |
| `npm run preview`         | Sirve localmente la compilacion de produccion.                      |
| `npm run lint`            | Ejecuta ESLint y Stylelint.                                         |
| `npm run format`          | Formatea el codigo con Prettier.                                    |
| `npm run format:check`    | Verifica el formateo sin modificar archivos.                        |
| `npm run test:lighthouse` | Ejecuta Lighthouse CI sobre `dist/`.                                |
| `npm run test:a11y`       | Ejecuta tests de accesibilidad con Playwright + axe-core.           |
| `npm run test:visual`     | Ejecuta capturas visuales con Playwright.                           |

## Estructura del proyecto

```
src/
  pages/              # Rutas del sitio
  pages/work/[slug].astro   # Pagina dinamica de detalle para proyectos
  pages/rss.xml.ts    # Endpoint de feed RSS
  layouts/            # Layouts compartidos
  components/         # Componentes reutilizables de interfaz
  content/work/*.mdx  # Entradas del portafolio
  content.config.ts   # Esquema de la coleccion de contenido
  data/               # Datos compartidos del sitio
  styles/
    global.css        # Punto de entrada de estilos
    base.css          # Tokens, reset y estilos base
    layout.css        # Estructuras de layout
    components.css    # Componentes UI
    pages.css         # Estilos especificos de paginas
    responsive.css    # Media queries y breakpoints
    utilities.css     # Clases utilitarias
  assets/images/      # Imagenes procesadas por Astro (build-time optimization)
public/               # Archivos estaticos publicados sin procesamiento
  assets/             # Assets estaticos (fuentes, scripts, media legacy)
  scripts/site.js     # JavaScript del sitio (menu, focus trap, etc.)
docs/site-capture/    # Material historico de referencia del sitio anterior
```

## Modelo de contenido

Cada proyecto en `src/content/work/` se define como un archivo MDX con frontmatter. Desde ahi se generan los listados, las paginas de detalle, el feed RSS y el contenido SEO.

Campos del esquema:

- `title` — Nombre del proyecto
- `client` — Cliente
- `service` — Servicio prestado
- `year` — Ano de realizacion (numero)
- `coverImage` — Imagen de portada (`image()` de Astro)
- `coverAlt` — Texto alternativo de la portada
- `gallery` — Array de imagenes con `src`, `alt` y `caption`
- `summary` — Resumen para listados y RSS
- `seoTitle` — Titulo para meta tags
- `seoDescription` — Descripcion para meta tags
- `featured` — Destacado en home (boolean)
- `order` — Orden de aparicion (numero)
- `liveUrl` — URL del proyecto en vivo (opcional)
- `legacySlugs` — Slugs historicos para redirecciones (array)
- `brief` — Descripcion del brief (opcional)
- `solution` — Descripcion de la solucion (opcional)
- `deliverables` — Lista de entregables (array)

## Convenciones de assets

### Imagenes procesadas (recomendado)

- Usa `src/assets/images/` para imagenes que beneficien optimizacion automatica.
- Astro genera variantes responsivas y formatos modernos (WebP/AVIF) en build.
- Referencia las imagenes con el componente `<Image>` de `astro:assets`.

### Assets estaticos

- Usa `public/assets/` para archivos que no requieran procesamiento (fuentes, scripts, media legacy).
- Prefiere subdirectorios descriptivos bajo `public/assets/`.
- Agrega texto alternativo significativo cuando el recurso aporte contenido.
- Las imagenes puramente decorativas pueden usar `alt=""`.

## CI/CD

El proyecto incluye un workflow de GitHub Actions en `.github/workflows/ci.yml` que ejecuta en cada push y pull request:

1. **Lint y build** — Valida codigo y genera el sitio.
2. **Lighthouse** — Corre auditorias de performance, accesibilidad, best practices y SEO.
3. **A11y** — Ejecuta tests de accesibilidad automatizados con Playwright.

## Flujo de trabajo recomendado

1. Instala dependencias con `npm install`.
2. Trabaja localmente con `npm run dev`.
3. Si cambias rutas, contenido o estilos, valida el resultado en navegador.
4. Antes de cerrar tu cambio, ejecuta `npm run lint` y `npm run build`.
5. Para cambios visibles, considera correr `npm run test:a11y` y `npm run test:lighthouse`.

## Notas

- `dist/`, caches, logs, resultados de pruebas y otros archivos generados no forman parte de la fuente de verdad del proyecto.
- `docs/site-capture/` debe tratarse solo como referencia historica, no como documentacion vigente de implementacion.
- No subas secretos ni archivos `.env` reales al repositorio.
- El sitio esta configurado en espanol de Chile (`lang="es-CL"`, `og:locale="es_CL"`).
