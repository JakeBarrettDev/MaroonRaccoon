"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/#about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <Image
            src="/MaroonRaccoonLogo.png"
            alt="Maroon Raccoon logo"
            width={42}
            height={42}
            className="navbar-logo"
            priority
          />
          <span className="navbar-wordmark">Maroon Raccoon</span>
        </Link>

        <nav className="navbar-links">
          {links.map((link) => {
            const target = link.href.split("#")[0] || "/";
            const isActive = target !== "/" && pathname.startsWith(target);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? "active" : ""}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
