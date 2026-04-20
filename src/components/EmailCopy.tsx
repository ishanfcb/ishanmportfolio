"use client";

import { useState } from "react";
import styles from "../app/about/about.module.css";
import { FiCopy, FiCheck } from "react-icons/fi";

export default function EmailCopy({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.emailWrap}>
      <button className={styles.emailButton} onClick={handleCopy} aria-label="Copy email">
        <span>Email</span>
        <span className={styles.copyIconWrap}>
          {copied ? (
            <FiCheck className={styles.copyIcon} />
          ) : (
            <FiCopy className={styles.copyIcon} />
          )}
        </span>
      </button>
      <span className={`${styles.emailTooltip} ${copied ? styles.emailTooltipVisible : ""}`}>
        {copied ? "Copied!" : email}
      </span>
    </div>
  );
}
