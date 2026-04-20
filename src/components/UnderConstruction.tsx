import styles from "./UnderConstruction.module.css";

export default function UnderConstruction() {
    return (
        <div className={styles.underConstructionDiv}>
            <h1>Under Construction</h1>
            <p>This project does not have any documentation apart from the thumbnail on the homepage. </p>
            <p>Please return to the homepage to explore other projects. Thank you!</p>
        </div>
    );
}