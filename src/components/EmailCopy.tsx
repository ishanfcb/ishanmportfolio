"use client";

import { useState } from "react";
import styles from "../app/about/about.module.css";

export default function EmailCopy({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={styles.emailWrap}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button className={styles.emailButton} onClick={handleCopy} aria-label="Copy email">
        <span>Email</span>
      </button>
      <span
        className={`${styles.emailTooltip} ${
          isHovered || copied ? styles.emailTooltipVisible : ""
        }`}
      >
        {copied ? "Copied!" : email}
      </span>
    </div>
  );
}