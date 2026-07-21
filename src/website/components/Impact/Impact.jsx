import "./Impact.css";

import { useRef } from "react";

import useReveal from "../../hooks/useReveal";

import Counter from "../ui/Counter/Counter";

import useSiteContentSection from "@shared/hooks/useSiteContentSection";

export default function Impact() {
    const sectionRef = useRef();

    const content =
        useSiteContentSection("impact");

    useReveal(sectionRef, {
        y: 80
    });

    if (!content) {
        return null;
    }

    return (
        <section
            id="wirkung"
            ref={sectionRef}
            className="impact"
        >
            <div className="impact__header">
                <span>
                    {content.eyebrow}
                </span>

                <h2>
                    {content.title}
                </h2>
            </div>

            <div className="impact__grid">
                {
                    content.items.map((item) => (
                        <article
                            key={item.id}
                            className="impact__card"
                        >
                            <h3>
                                <Counter
                                    value={item.value}
                                    suffix={item.suffix}
                                />
                            </h3>

                            <p>
                                {item.label}
                            </p>
                        </article>
                    ))
                }
            </div>
        </section>
    );
}