import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Link href="/" className="footer-brand">
          <Image
            src="/MaroonRaccoonLogo.png"
            alt="Maroon Raccoon logo"
            width={36}
            height={36}
            style={{ objectFit: "contain" }}
          />
          Maroon Raccoon
        </Link>

        <nav className="footer-links">
          <Link href="/#about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className="footer-contact">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.founder.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={site.founder.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} Maroon Raccoon — hand-built websites, no templates.
        </p>
      </div>
      <div className="footer-giant" aria-hidden="true">Maroon Raccoon</div>
    </footer>
  );
}
