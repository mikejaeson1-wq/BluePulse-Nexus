import "./Impact.css";

import { useRef } from "react";

import impact from "../../data/impact";

import useReveal from "../../hooks/useReveal";

import Counter from "../ui/Counter/Counter";

export default function Impact() {

    const sectionRef = useRef();

    useReveal(sectionRef, {

        y: 80

    });

    return (

        <section

            ref={sectionRef}

            className="impact"

        >

            <div className="impact__header">

                <span>

                    UNSERE WIRKUNG

                </span>

                <h2>

                    Gemeinsam bewegen wir mehr.

                </h2>

            </div>

            <div className="impact__grid">

                {impact.map((item) => (

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

                ))}

            </div>

        </section>

    );

}