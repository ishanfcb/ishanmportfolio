"use client";

import { useState } from "react";
import styles from "../app/about/about.module.css";
import ExternalIcon from "./ExternalIcon";

export default function TwitterLink({ href }: { href: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={styles.twitterWrap}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        Twitter <ExternalIcon className={styles.heroExtIcon} />
      </a>
      <span className={`${styles.twitterTooltip} ${isHovered ? styles.twitterTooltipVisible : ""}`}>
        yup i still call it twitter
      </span>
    </div>
  );
}