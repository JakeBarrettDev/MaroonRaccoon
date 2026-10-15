import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";

export const metadata = {
  title: "Projects & Portfolio",
  description:
    "Websites and apps built by Maroon Raccoon, including the Swesso art discovery app and the Jeff Conners Art portfolio. See what's shipped and what's in the works.",
  alternates: { canonical: "/projects" },
};

const projects = [
  {
    title: "Swesso",
    kicker: "Art discovery app",
    url: "https://swesso.com",
    image: "/projects/swesso.jpg",
    imageAlt: "The Swesso homepage: a dark museum painting behind the Swesso wordmark and a how-it-works panel",
    lede: "An art discovery app that teaches you about art, and about your own taste along the way. Built for anyone who has ever left a museum wanting more.",
    body: [
      "Swesso turns open-access museum collections into something you can swipe through: right if a work speaks to you, left if it doesn't. Love enough of one artist's work and you meet them properly, with a note on what caught your eye.",
      "Over time it learns what you're drawn to, so the next museum visit starts with a sense of what you're looking for. It's free, ad-free, and you can start looking without an account.",
    ],
    quote: "A museum visit is learning about two people: the artist, and yourself.",
    quoteSource: "Swesso homepage",
    facts: [
      { label: "Type", value: "Full-stack web app" },
      { label: "Built with", value: "React, Spring Boot, PostgreSQL, Redis, Docker" },
      { label: "Status", value: "Live" },
    ],
  },
  {
    title: "Jeff Conners Art",
    kicker: "Artist portfolio",
    url: "https://jeffconners.com",
    image: "/projects/jeffconners.jpg",
    imageAlt: "The Jeff Conners Art homepage: a full-bleed painting of a rainy city at night under the headline The city in rain",
    lede: "The online gallery of Kansas City artist Jeff Conners, showcasing his original work.",
    body: [
      "The paintings do the talking: full-bleed hero artwork, a gallery that filters by category, and a lightbox for looking closely.",
      "It's a static site, so it loads fast and costs next to nothing to host. Every update deploys automatically, with no server for anyone to maintain.",
    ],
    quote: "The city in rain. The light between buildings.",
    quoteSource: "Jeff Conners Art homepage",
    facts: [
      { label: "Type", value: "Portfolio website" },
      { label: "Built with", value: "Astro, TypeScript, Cloudflare Pages" },
      { label: "Status", value: "Live" },
    ],
  },
];

// Not built yet, so it gets a line instead of a case study.
const upcoming = [
  { title: "Tetrad", blurb: "a site for a construction and fiber optic company" },
];

export default function ProjectsPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <PageHero
        eyebrow="Portfolio"
        title="Projects"
        subtitle="Live work, start to finish: what each client needed, what I built, and how it runs."
        image="/PacketTyping.png"
        imageAlt="Packet typing on a laptop"
        imageSize="480px"
      />

      <div className="cases">
        {projects.map((project, index) => (
          <article key={project.title} className="case">
            <header className="case-head">
              <span className="case-num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <span className="eyebrow">{project.kicker}</span>
                <h2 className="case-title">{project.title}</h2>
              </div>
            </header>

            <div className="case-grid">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="case-shot browser-frame"
              >
                <div className="browser-bar" aria-hidden="true">
                  <span /><span /><span />
                </div>
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  width={1440}
                  height={900}
                  sizes="(max-width: 900px) 100vw, 760px"
                />
              </a>

              <aside className="case-facts">
                <dl>
                  {project.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Visit {project.url.replace("https://", "")} ↗
                </a>
              </aside>
            </div>

            <div className="case-body">
              <p className="case-lede">{project.lede}</p>
              <blockquote className="pull-quote">
                <p>“{project.quote}”</p>
                <cite>{project.quoteSource}</cite>
              </blockquote>
              {project.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      {upcoming.length > 0 && (
        <p className="projects-upcoming">
          <span className="eyebrow">Coming up</span>
          {upcoming.map((item) => (
            <span key={item.title}>
              <strong>{item.title}</strong>, {item.blurb}
            </span>
          ))}
        </p>
      )}

      <div className="cta-section">
        <h2 style={{ marginBottom: "1rem" }}>Ready to start your project?</h2>
        <p style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>
          You could be next on this list.
        </p>
        <Link href="/contact" className="cta-button">
          Get a quote
        </Link>
      </div>
    </main>
  );
}
