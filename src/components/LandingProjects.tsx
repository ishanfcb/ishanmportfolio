import Link from 'next/link';
import { projectsArray } from '../data/projects';
import styles from './LandingProjects.module.css';

// Get just the top 4 featured projects
const featuredProjects = projectsArray.filter(p => p.featured).slice(0, 4);

export default function LandingProjects() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {featuredProjects.map((p, i) => (
          <div key={p.slug} className={styles.row}>
            <div className={styles.mediaWrap}>
              {p.thumbnail.endsWith('.mp4') ? (
                <video 
                  src={p.thumbnail}
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className={styles.media}
                />
              ) : (
                <img 
                  src={p.thumbnail} 
                  alt={p.name}
                  className={styles.media}
                />
              )}
            </div>
            
            <div className={styles.content}>
              <h2 className={styles.title}>
                <Link href={`/projects/${p.slug}`} className={styles.titleLink} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {p.name}
                </Link>
              </h2>
              <p className={styles.description}>{p.description}</p>
              
              <div className={styles.tags}>
                {p.tags.map(tag => (
                  <Link href={`/projects?tag=${encodeURIComponent(tag)}`} key={tag} className={styles.tag}>
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
