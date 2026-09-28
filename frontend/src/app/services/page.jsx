import PageHero from "../../components/PageHero";
import Link from "next/link";
import Image from "next/image";

const icons = {
  website: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 13h6M7 16h4" />
    </>
  ),
  landing: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  refresh: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
};

export default function ServicesPage() {
  const services = [
    {
      title: "Small Business Website",
      icon: "website",
      description: "A modern multi-page site that looks great on mobile and is easy to maintain.",
      features: [
        "Home + Services + Contact",
        "Mobile-first + fast loading",
        "SEO optimized",
        "Easy to update"
      ]
    },
    {
      title: "Landing Page",
      icon: "landing",
      description: "One focused page built to convert visitors into calls, bookings, or messages.",
      features: [
        "Clear CTA + contact form",
        "Perfect for ads or promos",
        "Conversion-focused design",
        "A/B testing ready"
      ]
    },
    {
      title: "Fixes + Refresh",
      icon: "refresh",
      description: "Clean up an existing site: mobile issues, layout problems, speed, and polish.",
      features: [
        "Quick turnaround",
        "Prioritized improvements",
        "Performance boost",
        "Mobile optimization"
      ]
    }
  ];

  return (
    <main style={{ padding: "2rem" }}>
      <PageHero
        eyebrow="What I offer"
        title="Services"
        subtitle="Clear options, transparent pricing, and a smooth process."
        primaryCtaLabel="Get a Quote"
        primaryCtaHref="/contact"
        image="/services/PacketConsultant_Transparent.png"
        imageAlt="Packet has many services for your website needs!"
        imageSize="480px"
      />

      <div style={{ maxWidth: "1200px", margin: "3rem auto", textAlign: "center" }}>
        <div className="section-head">
          <h2>What I Offer</h2>
          <p>
            No templates. Just easy-to-maintain, fully custom websites tailored
            to your needs.
          </p>
          <div className="tail-divider" aria-hidden="true" />
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="card card-hover service-card">
              <div className="service-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {icons[service.icon]}
                </svg>
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* PDF Download Section */}
        <div className="cta-section">
          <h2 style={{ marginBottom: "1rem" }}>Want the Full Breakdown?</h2>
          <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
            Download my comprehensive services guide with detailed pricing and timelines.
          </p>
          <Link 
            href="/services/MaroonRaccoon-Web-Services-Guide.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cta-button"
          >
            Download Services PDF
          </Link>
        </div>
      </div>
    </main>
  );
}
