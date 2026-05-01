# Plinto.cl

Sitio estatico desarrollado con Astro para Plinto, estudio enfocado en estrategia, contenidos y comunicacion para marcas de arquitectura y construccion.

## Stack

- `Astro 6`
- `TypeScript`
- `@astrojs/mdx` para fichas de proyectos
- `@astrojs/sitemap` para generacion de sitemap
- `Playwright` disponible para capturas visuales locales

## Requisitos

- `Node.js` compatible con las dependencias definidas en `package-lock.json`
- `npm`

## Comandos

- `npm install`: instala las dependencias del proyecto.
- `npm run dev`: levanta el entorno local de desarrollo.
- `npm run build`: ejecuta `astro check` y genera la version de produccion en `dist/`.
- `npm run preview`: sirve localmente la compilacion de produccion.

## Estructura del proyecto

- `src/pages/`: rutas del sitio.
- `src/pages/work/[slug].astro`: pagina dinamica de detalle para proyectos.
- `src/layouts/`: layouts compartidos.
- `src/components/`: componentes reutilizables de interfaz.
- `src/content/work/*.mdx`: entradas del portafolio.
- `src/content.config.ts`: esquema de la coleccion de contenido.
- `src/data/`: datos compartidos del sitio.
- `src/styles/global.css`: tokens, estilos globales y reglas base.
- `public/`: archivos estaticos publicados sin procesamiento.
- `docs/site-capture/`: material historico de referencia del sitio anterior.

## Modelo de contenido

Cada proyecto en `src/content/work/` se define como un archivo MDX con frontmatter. Desde ahi se generan los listados, las paginas de detalle y parte del contenido SEO.

Campos usados actualmente:

- `title`
- `client`
- `service`
- `year`
- `coverImage`
- `gallery`
- `summary`
- `seoTitle`
- `seoDescription`
- `featured`
- `order`
- `liveUrl`
- `legacySlugs`
- `brief`
- `solution`
- `deliverables`

## Convenciones de assets

- Prefiere nuevas rutas bajo `public/assets/`.
- Usa nombres descriptivos para imagenes y otros archivos estaticos.
- Agrega texto alternativo significativo cuando el recurso aporte contenido.

## Flujo de trabajo recomendado

1. Instala dependencias con `npm install`.
2. Trabaja localmente con `npm run dev`.
3. Si cambias rutas, contenido o estilos, valida el resultado en navegador.
4. Antes de cerrar tu cambio, ejecuta `npm run build`.

## Notas

- `dist/`, caches, logs, resultados de pruebas y otros archivos generados no forman parte de la fuente de verdad del proyecto.
- `docs/site-capture/` debe tratarse solo como referencia historica, no como documentacion vigente de implementacion.
- No subas secretos ni archivos `.env` reales al repositorio.
