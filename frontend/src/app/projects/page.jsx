import Link from "next/link";
import PageHero from "@/components/PageHero";
import ProjectArt from "@/components/ProjectArt";

export const metadata = {
  title: "Projects & Portfolio",
  description:
    "Websites and apps built by Maroon Raccoon, including the Swesso art discovery app and the Jeff Conners Art portfolio. See what's shipped and what's in the works.",
  alternates: { canonical: "/projects" },
};

const statusStyles = {
  "Shipped": "status-shipped",
  "In Development": "status-progress",
  "Planning": "status-planning",
};

export default function ProjectsPage() {
  const projects = [
    {
      title: "Swesso, the Art Discovery app",
      description: "An art discovery app that teaches you about art, and about your own taste along the way. Built for anyone who has ever left a museum wanting more.",
      status: "Shipped",
      timeline: "Live now",
      art: "swesso"
    },
    {
      title: "Jeff Conners Art",
      description: "The online gallery of Kansas City artist Jeff Conners, showcasing his original work.",
      status: "Shipped",
      timeline: "Live now",
      art: "jeffconners"
    },
  ];

  // Not built yet, so it gets a line instead of a card.
  const upcoming = [
    { title: "Tetrad", blurb: "a site for a construction and fiber optic company" },
  ];

  return (
    <main style={{ padding: "2rem" }}>
      <PageHero
        eyebrow="Portfolio"
        title="Projects"
        subtitle="Bringing creative visions to life through thoughtful design and development."
        image="/PacketTyping.png"
        imageAlt="Packet typing on a laptop"
        imageSize="480px"
      />

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.title} className="card card-hover project-card">
            <ProjectArt name={project.art} />
            <div className={`project-status-badge ${statusStyles[project.status] ?? "status-planning"}`}>
              {project.status}
            </div>
            <h3 className="project-title">{project.title}</h3>
            <p className="project-description">{project.description}</p>
            <div className="project-timeline">
              {project.timeline}
            </div>
          </div>
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
