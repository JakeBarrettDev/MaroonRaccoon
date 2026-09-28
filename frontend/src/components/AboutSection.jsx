const stats = [
  { value: "2", label: "projects shipped" },
  { value: "0", label: "templates used" },
  { value: "1", label: "very dedicated raccoon" },
];

export default function AboutSection() {
  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
      <span className="eyebrow">About</span>
      <h2>
        The person behind <span className="accent">Maroon Raccoon</span>
      </h2>
      <div className="tail-divider" aria-hidden="true" style={{ marginBottom: "2rem" }} />

      <div style={{ display: "grid", gap: "1.25rem", color: "var(--text-muted)", fontSize: "1.1rem", textAlign: "left" }}>
        <p>
          Hi, I’m Jake — the founder of Maroon Raccoon. I build clean, modern
          websites for people who want a strong online presence without the
          confusion, unnecessary costs, or technical runaround that often comes
          with web development.
        </p>
        <p>
          I focus on clear communication, transparent pricing, and custom
          solutions that fit your needs — not templates or one-size-fits-all
          approaches. My goal is simple: make the process straightforward and
          deliver something you’re proud to share.
        </p>
        <p>
          If you’re interested in working together, I’d love to hear about your
          project. Reach out through the <a href="/contact">contact page</a> and
          we can talk through next steps.
        </p>
      </div>

      <dl className="stat-row">
        {stats.map((stat) => (
          <div key={stat.label} className="stat">
            <dt className="stat-label">{stat.label}</dt>
            <dd className="stat-value">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
