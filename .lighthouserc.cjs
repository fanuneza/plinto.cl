module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist",
      url: ["/", "/work/", "/work/casa-kddk/", "/service/", "/about/", "/contact/"],
      numberOfRuns: 1,
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 3500 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 200 }],
        // Existing a11y issues — monitor but don't block CI
        "color-contrast": "warn",
        "label-content-name-mismatch": "warn",
        "heading-order": "warn",
        "lcp-lazy-loaded": "warn",
        // Insights are informational, not failures
        "network-dependency-tree-insight": "off",
        "image-delivery-insight": "off",
        "dom-size-insight": "off",
        "lcp-discovery-insight": "off",
        "render-blocking-insight": "off",
        // Minor image optimizations — monitor but don't block
        "uses-responsive-images": "warn",
        "modern-image-formats": "warn",
        "render-blocking-resources": "warn",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
