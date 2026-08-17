'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './VerticalNav.module.css';

interface NavItem {
    id: string;
    title: string;
    level: number;
}

export default function VerticalNav() {
    const [items, setItems] = useState<NavItem[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const extractedItems: NavItem[] = [];
        const headingElements = document.querySelectorAll('h3, [class*="headingSection"] h3');

        headingElements.forEach((el, index) => {
            let id = el.id;
            if (!id) {
                const textContent = el.textContent || `section-${index}`;
                id = textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                el.id = id;
            }
            const text = el.textContent || `Section ${index + 1}`;
            const level = el.tagName.toLowerCase() === 'h4' ? 2 : 1;
            extractedItems.push({ id, title: text, level });
        });

        // Fallback if no explicit h3 elements found
        if (extractedItems.length === 0) {
            const sectionGroups = document.querySelectorAll('[class*="sectionGroup"]');
            sectionGroups.forEach((el, index) => {
                let id = el.id;
                if (!id) {
                    id = `section-group-${index + 1}`;
                    el.id = id;
                }
                const firstText = el.querySelector('p, h3, h2')?.textContent?.slice(0, 24) || `Section 0${index + 1}`;
                extractedItems.push({ id, title: firstText, level: 1 });
            });
        }

        setItems(extractedItems);
    }, []);

    useEffect(() => {
        if (items.length === 0) return;

        const handleScroll = () => {
            const viewportHeight = window.innerHeight;
            const focusPoint = viewportHeight * 0.35;
            let currentActive = 0;

            items.forEach((item, index) => {
                const el = document.getElementById(item.id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= focusPoint) {
                        currentActive = index;
                    }
                }
            });

            // Boundary: if scrolled near the bottom of the page
            if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 80)) {
                currentActive = items.length - 1;
            }

            setActiveIndex(currentActive);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [items]);

    if (items.length === 0) return null;

    const scrollToSection = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            const yOffset = -90;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <aside 
            ref={navRef}
            className={`${styles.verticalNavContainer} ${isHovered ? styles.isHovered : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Page section navigation"
        >
            <div className={styles.navTrack}>
                {items.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <div 
                            key={item.id} 
                            className={`${styles.navItem} ${isActive ? styles.active : ''} ${item.level === 2 ? styles.subItem : ''}`}
                            onClick={(e) => scrollToSection(item.id, e)}
                        >
                            <span className={styles.tickLine} />
                            <span className={styles.itemLabel}>{item.title}</span>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}