// Single source of truth for business details used in metadata and JSON-LD.
// Empty strings are left out of the structured data, so fill these in as you have them.

// Vercel sets VERCEL_PROJECT_PRODUCTION_URL to the production domain automatically;
// NEXT_PUBLIC_SITE_URL wins if you want to pin it explicitly.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const site = {
  name: "Maroon Raccoon",
  legalName: "", // e.g. "Maroon Raccoon LLC" — match your state filing exactly
  description:
    "Maroon Raccoon designs and builds fast, modern, hand-built websites and web apps for small businesses and creatives — no templates, no runaround, no surprise costs.",
  email: "maroonraccoondev@gmail.com",
  areaServed: "United States",
  founder: {
    name: "Jake Barrett",
    jobTitle: "Founder & Web Developer",
    linkedin: "https://www.linkedin.com/in/jacob-barrett-844007115/", // e.g. "https://www.linkedin.com/in/your-handle"
    github: "https://github.com/JakeBarrettDev",
  },
  // Business profiles that prove this entity is real (LinkedIn company page,
  // Google Business Profile, Clutch, etc.). These are what anchor the entity.
  sameAs: [
    "https://www.linkedin.com/in/jacob-barrett-844007115/", // e.g. "https://www.linkedin.com/company/maroon-raccoon"
  ],
  services: [
    "Custom website design",
    "Web development",
    "Full-stack web applications",
    "Interactive 3D web experiences",
  ],
};
