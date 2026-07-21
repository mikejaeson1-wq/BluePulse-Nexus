import "./Hero.css";

import { useRef } from "react";

import Button from "../ui/Button/Button";

import useReveal from "../../hooks/useReveal";

import useSiteContentSection from "@shared/hooks/useSiteContentSection";

export default function Hero() {
    const contentRef = useRef();

    const content =
        useSiteContentSection("hero");

    useReveal(contentRef);

    if (!content) {
        return null;
    }

    return (
        <section
            id="start"
            className="hero"
        >
            <div className="hero__backgroundGlow" />

            <div
                ref={contentRef}
                className="hero__content"
            >
                <span className="hero__subtitle">
                    {content.subtitle}
                </span>

                <h1>
                    {content.titleLine1}

                    <br />

                    {content.titleLine2}
                </h1>

                <p>
                    {content.description}
                </p>

                <div className="hero__buttons">
                    {
                        content.primaryButtonLabel && (
                            <Button
                                href={
                                    content.primaryButtonHref
                                }
                            >
                                {
                                    content.primaryButtonLabel
                                }
                            </Button>
                        )
                    }

                    {
                        content.secondaryButtonLabel && (
                            <Button
                                variant="secondary"
                                href={
                                    content.secondaryButtonHref
                                }
                            >
                                {
                                    content.secondaryButtonLabel
                                }
                            </Button>
                        )
                    }
                </div>
            </div>

            <div className="hero__earth" />
        </section>
    );
}