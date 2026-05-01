const MODERN_WIDTHS = [480, 800, 1200] as const;
const RASTER_WIDTHS = [480, 640, 800, 960, 1200] as const;

const stripExtension = (src: string) => src.replace(/\.[^/.]+$/, "");
const getExtension = (src: string) => src.match(/\.[^/.]+$/)?.[0] ?? "";

export const getVariantWidths = (originalWidth: number, candidateWidths: readonly number[] = RASTER_WIDTHS) => {
  const widths = candidateWidths.filter((width) => width < originalWidth).map((width) => Number(width));
  const largestWidth = Math.min(originalWidth, candidateWidths[candidateWidths.length - 1]);

  if (!widths.includes(largestWidth)) {
    widths.push(largestWidth);
  }

  return widths;
};

export const getResponsiveImageSources = (src: string, originalWidth: number) => {
  const basePath = stripExtension(src);
  const widths = getVariantWidths(originalWidth, MODERN_WIDTHS);

  const toSrcSet = (format: "avif" | "webp") =>
    widths.map((width) => `${basePath}-${width}.${format} ${width}w`).join(", ");

  return {
    avif: toSrcSet("avif"),
    webp: toSrcSet("webp"),
  };
};

export const getRasterImageSrcSet = (src: string, originalWidth: number) => {
  const extension = getExtension(src);
  const supportedRasterExtensions = new Set([".jpg", ".jpeg", ".webp"]);

  if (!supportedRasterExtensions.has(extension.toLowerCase())) {
    return undefined;
  }

  const basePath = stripExtension(src);
  const widths = getVariantWidths(originalWidth);
  const variantSrcSet = widths
    .filter((width) => width < originalWidth)
    .map((width) => `${basePath}-${width}${extension} ${width}w`);

  return [...variantSrcSet, `${src} ${originalWidth}w`].join(", ");
};
