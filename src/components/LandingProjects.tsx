"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { projectsArray } from '../data/projects';
import styles from './LandingProjects.module.css';

// Get just the top 4 featured projects
const featuredProjects = projectsArray.filter(p => p.featured).slice(0, 4);

export default function LandingProjects() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          if (index !== activeIndex) {
            setFade(true);
            setTimeout(() => {
              setActiveIndex(index);
              setFade(false);
            }, 300); // matches CSS transition
          }
        }
      });
    }, {
      rootMargin: "-45% 0px -45% 0px" // Trigger when element hits center 10% of viewport
    });

    imageRefs.current.forEach(ref => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => observerRef.current?.disconnect();
  }, [activeIndex]);

  const activeProject = featuredProjects[activeIndex] || featuredProjects[0];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        {/* Left Column - Sticky Title */}
        <div className={styles.leftCol}>
          <h2 className={styles.sectionTitle}>Selected<br />Projects</h2>
        </div>

        {/* Center Column - Scrolling Images */}
        <div className={styles.centerCol}>
          {featuredProjects.map((p, i) => (
            <div key={p.slug}>
              <Link 
                href={`/projects/${p.slug}`}
                className={`${styles.imageWrap} ${i !== activeIndex ? styles.inactive : ''}`}
                ref={el => { imageRefs.current[i] = el; }}
                data-index={i}
              >
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
              </Link>
              
              {/* Mobile Details (Hidden on desktop) */}
              <div className={styles.mobileDetails}>
                <h3 className={styles.title}>{p.name}</h3>
                <p className={styles.description}>{p.description}</p>
                <div className={styles.tags} style={{justifyContent: 'flex-start'}}>
                  {p.tags.map(tag => (
                    <button
                      key={tag}
                      className={styles.tag}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/projects?tag=${encodeURIComponent(tag)}`);
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Sticky Details */}
        <div className={styles.rightCol}>
          <div className={`${styles.detailsWrap} ${fade ? styles.fade : ''}`}>
            <h3 className={styles.title}>{activeProject.name}</h3>
            <p className={styles.description}>{activeProject.description}</p>
            <div className={styles.tags}>
              {activeProject.tags.map(tag => (
                <button
                  key={tag}
                  className={styles.tag}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/projects?tag=${encodeURIComponent(tag)}`);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div style={{marginTop: '32px'}}>
              <Link href={`/projects/${activeProject.slug}`} style={{color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.8rem'}}>
                View Project &rarr;
              </Link>
            </div>
          </div>
        </div>

      </div>

      <div className={styles.playgroundWrap}>
        <span className={styles.playgroundText}>Playground (coming soon)</span>
      </div>
    </section>
  );
}
