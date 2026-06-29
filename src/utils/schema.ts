import {
  makeIds,
  buildWebSite,
  buildWebPage,
  buildArticle,
  buildPiece,
  buildBreadcrumbList,
  type WebPageInput,
  type ArticleInput,
  type GraphEntity,
  type WebSiteInput,
  type BreadcrumbItem,
} from "@jdevalk/seo-graph-core";

const SITE_URL = "https://plinto.cl";

export function buildSchemaGraph(options: {
  pageType: "website" | "blogPost" | "webpage";
  url: string;
  title: string;
  description: string;
  publishDate?: Date;
  authorName?: string;
  featureImageUrl?: string;
  category?: string;
}) {
  const ids = makeIds({ siteUrl: SITE_URL });
  const pieces: GraphEntity[] = [];

  // 1. WebSite (Configurado con SearchAction de búsqueda interna)
  pieces.push(
    buildWebSite(
      {
        url: SITE_URL,
        name: "Plinto",
        description:
          "Estudio de estrategia, contenido y comunicación para marcas del mundo de la arquitectura y la construcción.",
        publisher: { "@id": ids.organization("plinto") },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_URL}/?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          } as unknown as Record<string, unknown>,
        ],
      } as unknown as WebSiteInput,
      ids
    ) as GraphEntity
  );

  // 2. Organización / Autor / Persona
  pieces.push(
    buildPiece({
      "@type": "Organization",
      "@id": ids.organization("plinto"),
      name: "Plinto",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.svg`,
      },
    }) as GraphEntity
  );

  const authorId = `${SITE_URL}/#author-fernanda`;
  pieces.push(
    buildPiece({
      "@type": "Person",
      "@id": authorId,
      name: options.authorName || "Fernanda Castro",
      url: `${SITE_URL}/about/`,
      knowsAbout: ["Estrategia de Contenidos", "Arquitectura", "Comunicación Digital"],
    }) as GraphEntity
  );

  // 3. WebPage y/o Article (si aplica)
  const webPageInput: WebPageInput = {
    url: options.url,
    name: options.title,
    description: options.description,
    isPartOf: { "@id": ids.website },
  };

  // Build breadcrumbs dynamically if not homepage
  const pathname = new URL(options.url).pathname.replace(/\/$/, "");
  if (pathname && pathname !== "") {
    const segments = pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // Always start with Home
    items.push({
      name: "Home",
      url: SITE_URL + "/",
    });

    let currentPath = SITE_URL;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}/`;

      let name = segment.toUpperCase();
      if (i === segments.length - 1) {
        name = options.title;
      } else if (segment === "work") {
        name = "Work";
      }

      items.push({
        name,
        url: currentPath,
      });
    }

    pieces.push(
      buildBreadcrumbList(
        {
          url: options.url,
          items,
        },
        ids
      ) as GraphEntity
    );

    webPageInput.breadcrumb = { "@id": ids.breadcrumb(options.url) };
  }

  if (options.publishDate) {
    webPageInput.datePublished = options.publishDate;
  }
  pieces.push(buildWebPage(webPageInput, ids) as GraphEntity);

  if (options.pageType === "blogPost") {
    const articleInput: ArticleInput = {
      url: options.url,
      isPartOf: { "@id": ids.webPage(options.url) },
      headline: options.title,
      description: options.description,
      datePublished: options.publishDate || new Date(),
      author: { "@id": authorId },
      publisher: { "@id": ids.organization("plinto") },
    };
    if (options.category) {
      articleInput.articleSection = options.category;
    }
    pieces.push(buildArticle(articleInput, ids, "BlogPosting") as GraphEntity);
  }

  return {
    "@context": "https://schema.org" as const,
    "@graph": pieces,
  };
}
