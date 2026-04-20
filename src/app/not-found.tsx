import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "404",
};

export default function NotFound() {
  return (
    <main className={styles.container}>
      <h1 className={styles.code}>
        404<span className={styles.dot}>.</span>
      </h1>
      <p className={styles.message}>
        Nothing here. The work is elsewhere.
      </p>
      <Link href="/" className={styles.link}>
        Back to Home
      </Link>
    </main>
  );
}
