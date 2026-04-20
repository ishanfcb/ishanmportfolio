"use client";

import styles from "./MuseumPlayground.module.css";

export default function MuseumPlayground() {
  return (
    <div className={styles.placard}>
      <div className={styles.inner}>
        <h2 className={styles.name}>ishan</h2>
        <p className={styles.bio}>(b. 1997, India)</p>
        <p className={styles.medium}>
          Artist and Engineer
          <br />
          Aerospace Engineering, Data Science, New Media Art
        </p>
        <p className={styles.exhibitions}>
          Selected exhibitions include LUMA (2024), NYCxDesign (2025), Currents
          New Media (2025), Grace Exhibition Space (2023), and Parsons &times; LG
          AI Research (2023).
        </p>
        <p className={styles.keywords}>
          Keywords: Multidisciplinary, Interactive, Technologist, Introspective,
          Embodied, Immersive, Experimental, Human, Storyteller, Builder
        </p>
        <p className={styles.materials}>
          Mixed media: code, projection, copper, mist, the human body
        </p>
      </div>
    </div>
  );
}
