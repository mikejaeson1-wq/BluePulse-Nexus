import "./Hero.css";

import { useRef } from "react";

import Button from "../ui/Button/Button";

import useReveal from "../../hooks/useReveal";

export default function Hero() {

    const contentRef = useRef();

    useReveal(contentRef);

    return (

        <section className="hero">

            <div className="hero__backgroundGlow" />

            <div
                ref={contentRef}
                className="hero__content"
            >

                <span className="hero__subtitle">

                    GEMEINNÜTZIGER TIERSCHUTZVEREIN

                </span>

                <h1>

                    Every Life
                    <br />
                    Matters

                </h1>

                <p>

                    Gemeinsam schützen wir Tiere,
                    Meere und Natur.
                    Jede Stimme zählt.
                    Jede Spende hilft.
                    Jedes Leben ist wertvoll.

                </p>

                <div className="hero__buttons">

                    <Button>

                        Mitglied werden

                    </Button>

                    <Button variant="secondary">

                        Mehr erfahren

                    </Button>

                </div>

            </div>

            <div className="hero__earth" />

        </section>

    );

}