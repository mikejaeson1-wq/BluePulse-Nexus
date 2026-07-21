import "./Participation.css";

import {
    useRef
} from "react";

import Button from "../ui/Button/Button";
import MediaImage from "../ui/MediaImage/MediaImage";

import useReveal from "../../hooks/useReveal";

import useSiteContentSection from "@shared/hooks/useSiteContentSection";

function isExternalLink(href) {
    return /^https?:\/\//i.test(
        href ?? ""
    );
}

export default function Participation() {
    const sectionRef =
        useRef();

    const content =
        useSiteContentSection(
            "participation"
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
            id="mitmachen"
            ref={sectionRef}
            className="participation"
        >
            <div className="participation__glow" />

            <div className="participation__header">
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

            <div className="participation__grid">
                {
                    content.items.map(
                        (item, index) => {
                            const external =
                                isExternalLink(
                                    item.href
                                );

                            return (
                                <article
                                    key={item.id}
                                    className="participation__card"
                                >
                                    <MediaImage
                                        reference={
                                            item.image
                                        }
                                        alt={
                                            item.title
                                        }
                                    />

                                    <div className="participation__number">
                                        {
                                            String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )
                                        }
                                    </div>

                                    <i
                                        className={
                                            `bi ${item.icon} participation__icon`
                                        }
                                        aria-hidden="true"
                                    />

                                    <h3>
                                        {item.title}
                                    </h3>

                                    <p>
                                        {item.text}
                                    </p>

                                    {
                                        item.buttonLabel &&
                                        item.href && (
                                            <Button
                                                variant="secondary"
                                                href={
                                                    item.href
                                                }
                                                target={
                                                    external
                                                        ? "_blank"
                                                        : "_self"
                                                }
                                            >
                                                {
                                                    item.buttonLabel
                                                }

                                                <span aria-hidden="true">
                                                    →
                                                </span>
                                            </Button>
                                        )
                                    }
                                </article>
                            );
                        }
                    )
                }
            </div>
        </section>
    );
}