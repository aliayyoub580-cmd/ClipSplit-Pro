export const SITE_URL = "https://clipsplitpro.com";
export const SITE_NAME = "ClipSplit Pro";
export const DEFAULT_TITLE = "Free Online Video Splitter - Split Videos into Short Clips";
export const DEFAULT_DESCRIPTION = "Split long videos into multiple short clips online. Choose clip duration from 3 to 15 seconds and download all clips instantly. No login required.";

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href)
    }))
  };
}
