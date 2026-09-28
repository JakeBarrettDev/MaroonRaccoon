import Link from "next/link";
import Image from "next/image";

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

        <p className="footer-copy">
          © {new Date().getFullYear()} Maroon Raccoon — hand-built websites, no templates.
        </p>
      </div>
      <div className="footer-giant" aria-hidden="true">Maroon Raccoon</div>
    </footer>
  );
}
