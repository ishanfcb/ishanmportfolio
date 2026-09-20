"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/photographs", label: "Photographs" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 20) {
        setVisible(true);
        setScrolled(false);
      } else {
        setScrolled(true);
        // Scrolling downward: hide nav
        if (currentScrollY > prevScrollY.current + 5) {
          setVisible(false);
        }
        // Scrolling upward: show nav
        else if (currentScrollY < prevScrollY.current - 5) {
          setVisible(true);
        }
      }

      prevScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`${styles.nav} ${!visible ? styles.navHidden : ""} ${
        scrolled ? styles.navScrolled : ""
      }`}
    >
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo}>
          ishan<span className={styles.logoDot} aria-hidden="true" />
        </Link>

        <ul className={styles.links}>
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.link} ${
                    isActive ? styles.active : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
