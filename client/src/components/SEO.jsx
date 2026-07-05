import { Helmet } from "react-helmet-async";
import { absoluteUrl, DEFAULT_DESCRIPTION, DEFAULT_TITLE, softwareApplicationSchema } from "../utils/seo";

export default function SEO({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, path = "/", image = "/og-image.svg", type = "website", jsonLd = [] }) {
  const canonical = absoluteUrl(path);
  const schemas = [softwareApplicationSchema(), ...jsonLd];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={absoluteUrl(image)} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteUrl(image)} />
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
