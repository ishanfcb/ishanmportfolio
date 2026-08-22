import type { Metadata } from "next";
import aboutData from "@/content/about.json";
import ExternalIcon from "@/components/ExternalIcon";
import EmailCopy from "@/components/EmailCopy";
import TwitterLink from "@/components/TwitterLink";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "about",
  description:
    "A third-year interaction design student with a deep-rooted passion for interactive data visualization.",
};

export default function AboutPage() {
  return (
    <main className={styles.about}>
      {/* Hero bio */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.hoverContainer}>
            <p className={`${styles.summary} ${styles.summaryArt} ${styles.hoverText}`}>{aboutData.bio}</p>
            <img src="/shadow-door.jpeg" alt="Shadow on door" className={styles.hoverImage} />
          </div>
        </div>
        <div className={styles.heroAside}>
          <div className={styles.heroLinks}>
            <EmailCopy email={aboutData.contact.email} />
            <TwitterLink href={aboutData.contact.twitter} />
            <a href={aboutData.contact.instagram} target="_blank" rel="noopener noreferrer">
              Instagram <ExternalIcon className={styles.heroExtIcon} />
            </a>
            <a href={aboutData.contact.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn <ExternalIcon className={styles.heroExtIcon} />
            </a>
            <a href="https://drive.google.com/file/d/1xYZl0ccAwTTdpBXDojaLYIZQBVPVUzZE/view?usp=sharing" target="_blank" rel="noopener noreferrer">
              Resume <ExternalIcon className={styles.heroExtIcon} />
            </a>
          </div>
        </div>
      </section>

      {/* Professional Experience */}
      <section id="experience" className={styles.section}>
        <h2 className={styles.sectionTitle}>Professional Experience</h2>
        <ul className={styles.list}>
          {aboutData.experience.map((e) => (
            <li key={e.company + e.period} className={styles.exhibRow}>
              <span className={styles.rowName}>
                {e.liveUrl ? (
                  <a
                    href={e.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.nameLink}
                  >
                    {e.company}
                    <ExternalIcon className={styles.inlineExtIcon} />
                  </a>
                ) : (
                  e.company
                )}
              </span>
              <span className={styles.rowDesc}>{e.title}</span>
              <span className={styles.rowMeta}>{e.description}</span>
              <span className={styles.rowYear}>{e.period}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Exhibitions */}
      <section id="exhibitions" className={styles.section}>
        <h2 className={styles.sectionTitle}>Exhibitions</h2>
        <ul className={styles.list}>
          {aboutData.exhibitions.map((e) => (
            <li key={e.venue + e.year} className={styles.exhibRow}>
              <span className={styles.rowName}>
                {e.href ? (
                  <a
                    href={e.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.nameLink}
                  >
                    {e.venue}
                    <ExternalIcon className={styles.inlineExtIcon} />
                  </a>
                ) : (
                  e.venue
                )}
              </span>
              <span className={styles.rowDesc}>{e.work}</span>
              <span className={styles.rowMeta}>{e.location}</span>
              <span className={styles.rowYear}>{e.year}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}



