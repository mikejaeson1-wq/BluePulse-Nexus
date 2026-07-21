import "./Projects.css";

import {
    useRef
} from "react";

import MediaImage from "../ui/MediaImage/MediaImage";

import useReveal from "../../hooks/useReveal";

import useSiteContentSection from "@shared/hooks/useSiteContentSection";

export default function Projects() {
    const sectionRef =
        useRef();

    const content =
        useSiteContentSection(
            "projects"
        );

    useReveal(
        sectionRef,
        {
            y: 80,
            duration: 1
        }
    );

    if (!content) {
        return null;
    }

    return (
        <section
            id="projekte"
            ref={sectionRef}
            className="projects"
        >
            <div className="projects__header">
                <span>
                    {content.eyebrow}
                </span>

                <h2>
                    {content.title}
                </h2>

                {
                    content.description && (
                        <p>
                            {
                                content.description
                            }
                        </p>
                    )
                }
            </div>

            <div className="projects__grid">
                {
                    content.items.map(
                        (item) => (
                            <article
                                key={item.id}
                                className="projects__card"
                            >
                                <MediaImage
                                    reference={
                                        item.image
                                    }
                                    alt={
                                        item.title
                                    }
                                />

                                <div className="projects__cardTop">
                                    <i
                                        className={
                                            `bi ${item.icon} projects__icon`
                                        }
                                        aria-hidden="true"
                                    />

                                    {
                                        item.status && (
                                            <span className="projects__status">
                                                {
                                                    item.status
                                                }
                                            </span>
                                        )
                                    }
                                </div>

                                <h3>
                                    {item.title}
                                </h3>

                                <p>
                                    {item.text}
                                </p>

                                {
                                    item.href &&
                                    item.linkLabel && (
                                        <a
                                            className="projects__link"
                                            href={
                                                item.href
                                            }
                                        >
                                            {
                                                item.linkLabel
                                            }

                                            <span aria-hidden="true">
                                                →
                                            </span>
                                        </a>
                                    )
                                }
                            </article>
                        )
                    )
                }
            </div>
        </section>
    );
}