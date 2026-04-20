import Image from "next/image";
import styles from "./ProjectPage.module.css";
import UnderConstruction from "./UnderConstruction";
import CloseButton from "./CloseButton";
import PagePreloader from "./PagePreloader";
import ResponsiveVideo from "./ResponsiveVideo";
import ExternalIcon from "./ExternalIcon";

interface Section {
    type: "text" | "image" | "video" | "heading";
    size: "h" | "f" | "t" | "t2" | "q" | "s";
    text?: string[];
    src?: string;
    alt?: string;
    style?: string;
    controls?: boolean;
    poster?: string;
}

interface Exhibition {
    venue: string;
    location: string;
    year: string;
    href: string;
}

interface Credit {
    name: string;
    role: string;
    url: string;
}

interface ProjectProps {
    project: {
        name: string;
        tags: string[];
        description: string;
        year: number;
        interactiveUrl?: string;
        githubUrl?: string;
        credits?: Credit[];
        content: {
            sections: Section[];
        }[];
    };
    exhibitions?: Exhibition[];
}

export default function ProjectPage({ project, exhibitions }: ProjectProps) {

    const hasContent = project.content && project.content.length > 0;
    const sourceUrl = project.githubUrl
        ?? (project.interactiveUrl?.includes("editor.p5js.org")
            ? project.interactiveUrl.replace("/full/", "/sketches/")
            : null);

    return (
        <>
            <PagePreloader />
            <div className={styles.projectPageDiv}>
                <CloseButton />
                <div className={styles.tagsContainer}>
                    {project.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                </div>
                <div className={styles.projectHeader}>
                    <div className={styles.headerText}>
                        <h1>{project.name}</h1>
                        <h2>{project.description}</h2>
                        <h2>[{project.year}]</h2>
                        {(project.interactiveUrl || sourceUrl) && (
                            <div className={styles.projectLinks}>
                                {project.interactiveUrl && (
                                    <a
                                        href={project.interactiveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.interactiveLink}
                                    >
                                        Try Interactive Version <ExternalIcon className={styles.linkIcon} />
                                    </a>
                                )}
                                {sourceUrl && (
                                    <a
                                        href={sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.interactiveLink}
                                    >
                                        View Source <ExternalIcon className={styles.linkIcon} />
                                    </a>
                                )}
                            </div>
                        )}
                        {exhibitions && exhibitions.length > 0 && (
                            <div className={styles.exhibitions}>
                                <span className={styles.exhibitionsLabel}>Exhibited at</span>
                                {exhibitions.map((ex, i) => (
                                    <a
                                        key={i}
                                        href={ex.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.exhibition}
                                    >
                                        {ex.venue}, {ex.location} ({ex.year})
                                    </a>
                                ))}
                            </div>
                        )}
                        {project.credits && project.credits.length > 0 && (
                            <div className={styles.credits}>
                                <span className={styles.creditsLabel}>Credits</span>
                                {project.credits.map((credit, i) => (
                                    <a
                                        key={i}
                                        href={credit.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.credit}
                                    >
                                        {credit.name} <span className={styles.creditRole}>({credit.role})</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.contentContainer}>
                    {hasContent ? (
                        project.content?.map((sectionGroup, index) => (
                            <div key={index} className={styles.sectionGroup}>
                                {sectionGroup.sections.map((section, idx) => {
                                    switch (section.type) {
                                        case "text":
                                            return (
                                                <div key={idx} className={`${styles[section.size]} ${styles.textSection}`}>
                                                    {section.text?.map((paragraph, pIndex) => (
                                                        <p key={pIndex}>{paragraph}</p>
                                                    ))}
                                                </div>
                                            );
                                        case "image":
                                            return (
                                                <div key={idx} className={`${styles[section.size]} ${styles.imageSection}`}>
                                                    <Image
                                                        src={section.src || ""}
                                                        alt={section.alt ?? ""}
                                                        width={1200}
                                                        height={800}
                                                        className={styles.image}
                                                        style={section.style ? Object.fromEntries(section.style.split(";").filter(Boolean).map(s => { const [k, v] = s.split(":").map(x => x.trim()); return [k, v]; })) : undefined}
                                                    />
                                                </div>
                                            );
                                        case "video":
                                            return (
                                                <div key={idx} className={`${styles[section.size]} ${styles.videoSection}`}>
                                                    <ResponsiveVideo src={section.src || ""} controls={section.controls} poster={section.poster} />
                                                </div>
                                            );
                                        case "heading":
                                            return (
                                                <div key={idx} className={`${styles.f} ${styles.headingSection}`}>
                                                    <h3>{section.text?.[0]}</h3>
                                                </div>
                                            );
                                        default:
                                            return null;
                                    }
                                })}

                            </div>
                        ))
                    ) : (
                        <UnderConstruction />
                    )}
                </div>
                <div className={styles.endOfPage}>
                    <hr />
                </div>


            </div>
        </>
    );
}
