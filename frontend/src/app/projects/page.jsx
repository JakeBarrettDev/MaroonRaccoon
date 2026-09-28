import PageHero from "@/components/PageHero";
import ProjectArt from "@/components/ProjectArt";

const statusStyles = {
  "Shipped": "status-shipped",
  "In Development": "status-progress",
  "Planning": "status-planning",
};

export default function ProjectsPage() {
  const projects = [
    {
      title: "Swesso, the Art Discovery app",
      description: "Swesso is an innovative art discovery app designed to connect users with new and exciting artworks. The app enhances the art exploration experience through personalized recommendations and interactive features.",
      status: "Shipped",
      timeline: "Live now",
      art: "swesso"
    },
    {
      title: "Jeff Conners Art",
      description: "Jeff Conners Art is a personal portfolio showcasing the artistic works of Jeff Conners. The website provides an immersive experience for art enthusiasts and potential clients.",
      status: "Shipped",
      timeline: "Live now",
      art: "jeffconners"
    },
    {
      title: "Tetrad",
      description: "Tetrad is a business devoted to quality construction and fiber optic solutions. Their website will reflect their commitment to excellence and innovation in the construction industry.",
      status: "Planning",
      timeline: "Q1 2026",
      art: "tetrad"
    }
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
              {project.status === "Shipped" ? project.timeline : `Expected: ${project.timeline}`}
            </div>
          </div>
        ))}
      </div>

      <div className="cta-section">
        <h2 style={{ marginBottom: "1rem" }}>Ready to start your project?</h2>
        <p style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>
          You could be next on this list.
        </p>
        <a href="/contact" className="cta-button">
          Let&apos;s Work Together
        </a>
      </div>
    </main>
  );
}
