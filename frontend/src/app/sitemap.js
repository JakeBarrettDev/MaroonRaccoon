import { SITE_URL } from "../lib/site";

const routes = [
  { path: "/", priority: 1 },
  { path: "/services", priority: 0.9 },
  { path: "/projects", priority: 0.8 },
  { path: "/contact", priority: 0.7 },
];

export default function sitemap() {
  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
