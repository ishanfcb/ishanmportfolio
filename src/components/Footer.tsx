import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footerOuter}>
      <div className={styles.footerInner}>
        <div className={styles.left}>
          <span>Portfolio V2. Click for <a href="https://ishanmishra.framer.website/" target="_blank" rel="noopener noreferrer">V1</a></span>
        </div>
        
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <div className={styles.emailWrap}>
              <a href="mailto:ishannnn10@gmail.com">Email</a>
              <span className={styles.emailTooltip} aria-label="Email address">
                ishannnn10@gmail.com
              </span>
            </div>
            <a href="https://www.linkedin.com/in/ishan-mishra-14079b230/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/ishanmishra__/" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
