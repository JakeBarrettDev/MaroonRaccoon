import { SITE_URL, site } from "../lib/site";

const compact = (list) => list.filter(Boolean);

const orgId = `${SITE_URL}/#organization`;
const founderId = `${SITE_URL}/#founder`;

const graph = [
  {
    "@type": "ProfessionalService",
    "@id": orgId,
    name: site.name,
    ...(site.legalName && { legalName: site.legalName }),
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-1024.png`,
    image: `${SITE_URL}/brand/logo-1024.png`,
    description: site.description,
    ...(site.email && { email: site.email }),
    areaServed: { "@type": "Country", name: site.areaServed },
    founder: { "@id": founderId },
    sameAs: compact(site.sameAs),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Web services",
      itemListElement: site.services.map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name },
      })),
    },
  },
  {
    "@type": "Person",
    "@id": founderId,
    name: site.founder.name,
    jobTitle: site.founder.jobTitle,
    worksFor: { "@id": orgId },
    sameAs: compact([site.founder.linkedin, site.founder.github]),
  },
  {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: site.name,
    publisher: { "@id": orgId },
  },
];

export default function StructuredData() {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  return (
    <script
      type="application/ld+json"
      // Escape "<" so the payload can never close the script tag early.
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }}
    />
  );
}
