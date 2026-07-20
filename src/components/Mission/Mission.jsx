import "./Mission.css";

import { useRef } from "react";

import mission from "../../data/mission";
import useReveal from "../../hooks/useReveal";

export default function Mission() {

    const sectionRef = useRef();

    useReveal(sectionRef, {

        y: 80,
        duration: 1

    });

    return (

        <section
            ref={sectionRef}
            className="mission"
        >

            <div className="mission__header">

                <span>UNSERE MISSION</span>

                <h2>

                    Gemeinsam verändern wir
                    die Welt.

                </h2>

            </div>

            <div className="mission__grid">

                {mission.map((item) => (

                    <article

                        key={item.id}

                        className="mission__card"

                    >

                        <i className={`bi ${item.icon} mission__icon`} />

                        <h3>

                            {item.title}

                        </h3>

                        <p>

                            {item.text}

                        </p>

                    </article>

                ))}

            </div>

        </section>

    );

}