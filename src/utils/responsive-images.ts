const RESPONSIVE_WIDTHS = [480, 800, 1200] as const;

const stripExtension = (src: string) => src.replace(/\.[^/.]+$/, "");

export const getVariantWidths = (originalWidth: number) => {
  const widths = RESPONSIVE_WIDTHS.filter((width) => width < originalWidth).map((width) => Number(width));
  const largestWidth = Math.min(originalWidth, RESPONSIVE_WIDTHS[RESPONSIVE_WIDTHS.length - 1]);

  if (!widths.includes(largestWidth)) {
    widths.push(largestWidth);
  }

  return widths;
};

export const getResponsiveImageSources = (src: string, originalWidth: number) => {
  const basePath = stripExtension(src);
  const widths = getVariantWidths(originalWidth);

  const toSrcSet = (format: "avif" | "webp") =>
    widths.map((width) => `${basePath}-${width}.${format} ${width}w`).join(", ");

  return {
    avif: toSrcSet("avif"),
    webp: toSrcSet("webp"),
  };
};
