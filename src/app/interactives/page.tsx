import type { Metadata } from "next";
import labItems from "@/content/lab.json";
import ExternalIcon from "@/components/ExternalIcon";
import styles from "./interactives.module.css";

export const metadata: Metadata = {
  title: "Interactives",
  description:
    "Interactive prototypes, p5.js sketches, and experiments by ishan.",
};

function isExternal(href: string) {
  return href.startsWith("http");
}

export default function LabPage() {
  return (
    <main className={styles.interactives}>
      <p className={styles.subtitle}>
        Interactive prototypes, p5.js sketches, and experiments.
      </p>

      <ul className={styles.list}>
        {labItems.map((item) => (
          <li key={item.name} className={styles.row}>
            <a
              href={item.href}
              target={isExternal(item.href) ? "_blank" : undefined}
              rel={isExternal(item.href) ? "noopener noreferrer" : undefined}
              className={styles.rowLink}
            >
              <div className={styles.thumbCell}>
                {item.thumbnail ? (
                  /\.(mp4|webm)$/i.test(item.thumbnail) ? (
                    <video
                      src={item.thumbnail}
                      className={styles.thumb}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className={styles.thumb}
                    />
                  )
                ) : (
                  <div className={styles.thumbPlaceholder}>
                    <span>p5</span>
                  </div>
                )}
              </div>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.description}>{item.description}</span>
              <ExternalIcon className={styles.extIcon} />
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
