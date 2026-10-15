import Link from "next/link";
import Image from "next/image";

export default function PageHero({
  eyebrow = null,
  title,
  subtitle,
  primaryCtaLabel = "Get a quote",
  primaryCtaHref = "/contact",
  image = null,
  imageAlt = "",
  imageSize = "400px"
}) {
  return (
    <section style={{ padding: "3rem 2rem" }}>
      <div className="page-hero-container">
        <div className="page-hero-text">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>

          {subtitle && <p className="lede">{subtitle}</p>}

          <Link href={primaryCtaHref} className="cta-button">
            {primaryCtaLabel}
          </Link>
        </div>

        {image && (
          <div className="page-hero-image" style={{ maxWidth: imageSize }}>
            <Image src={image} alt={imageAlt} width={800} height={800} />
          </div>
        )}
      </div>
    </section>
  );
}
