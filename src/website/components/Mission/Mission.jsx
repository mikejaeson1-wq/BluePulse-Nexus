import "./Mission.css";

import { useRef } from "react";

import useReveal from "../../hooks/useReveal";

import useSiteContentSection from "@shared/hooks/useSiteContentSection";

export default function Mission() {
    const sectionRef = useRef();

    const content =
        useSiteContentSection("mission");

    useReveal(sectionRef, {
        y: 80,
        duration: 1
    });

    if (!content) {
        return null;
    }

    return (
        <section
            id="ueber-uns"
            ref={sectionRef}
            className="mission"
        >
            <div className="mission__header">
                <span>
                    {content.eyebrow}
                </span>

                <h2>
                    {content.title}
                </h2>
            </div>

            <div className="mission__grid">
                {
                    content.items.map((item) => (
                        <article
                            key={item.id}
                            className="mission__card"
                        >
                            <i
                                className={
                                    `bi ${item.icon} mission__icon`
                                }
                            />

                            <h3>
                                {item.title}
                            </h3>

                            <p>
                                {item.text}
                            </p>
                        </article>
                    ))
                }
            </div>
        </section>
    );
}